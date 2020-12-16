const path = require('path')
  , core = require('@actions/core')
  , v3 = require('node-hue-api').v3
  , LightState = v3.lightStates.LightState
;

async function run() {
  try {
    const username = getRequiredInputValue('username')
      , host = getRequiredInputValue('bridge')
      , time = getRequiredInputValue('time_in_seconds')
    ;

    const api = await getHueApi(host, username);
    const lightNames = getLightNames();

    // Retrieve the corresponding Lights from the bridge that match the names provided
    const lights = await getLights(api, lightNames);

    // Shiny Xmas Disco Ball ;-)
    await xmasDisco(api, lights.map(light => light.id), time);

    // Report via the outputs the lights that we interacted with
    setLightOutputs(lights);
  } catch (err) {
    core.setFailed(err.message);
    core.error(err.stack);
  }
}

run();


function getRequiredInputValue(key) {
  return core.getInput(key, {required: true});
}


function setLightOutputs(lights) {
  const results = lights.map(light => {
    return {
      id: light.id,
      name: light.name,
      type: light.type,
      modelid: light.modelid
    }
  });

  core.setOutput('lights', results);
}


/**
 * Convert light names parameter into an array of names.
 * @returns {String[]} the lights as an array
 */
function getLightNames() {
  const lightNames = getRequiredInputValue('light_names');
  return lightNames.split(',').map(name => name.trim());
}


async function getLights(api, lightNames) {
  console.log(`Looking for lights: ${JSON.stringify(lightNames)}`);
  if (!lightNames || lightNames.length <= 0) {
    return Promise.resolve([]);
  }

  return api.lights.getAll().then(lights => {
    return lights.filter(light => {
      return lightNames.indexOf(light.name) > -1;
    });
  });
}


async function xmasDisco(api, lightIds, time) {
  const sleepPeriod = 300
    , maxLoops = Math.floor(time * 1000 / sleepPeriod)
  ;

  let looping = true
    , count = 0
    , up = false
    , hueInc = 20000
    , briInc = 100
  ;

  // Turn lights on to start
  let lightState = new LightState().on();
  await sendLightUpdate(api, lightState, ...lightIds);

  do {
    const lightState = new LightState().hue_inc(hueInc).bri_inc(briInc).transitionInstant();

    await sendLightUpdate(api, lightState, ...lightIds);

    // Alternate the settings for the lights
    up = !up;
    hueInc *= -1;
    briInc *= -1;

    count++;
    if (count > maxLoops) {
      looping = false;
    }

    await sleep(sleepPeriod);
  } while (looping);

  // Turn lights off once finished
  lightState = new LightState().off();
  await sendLightUpdate(api, lightState, ...lightIds);
}


async function sendLightUpdate(api, state, ...ids) {
  const promises = [];

  ids.forEach(id => {
    core.info(`Updating light ${id} to ${JSON.stringify(state.getPayload())}`);

    promises.push(api.lights.setLightState(id, state));
  });

  return Promise.all(promises);
}

async function sleep(timeMs) {
  return new Promise(resolve => setTimeout(resolve, timeMs));
}

async function getHueApi(host, username) {
  return v3.api.createLocal(host).connect(username)
}