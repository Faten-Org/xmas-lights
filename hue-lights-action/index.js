const path = require('path')
  , core = require('@actions/core')
  , v3 = require('node-hue-api').v3
  , LightState = v3.lightStates.LightState
;

const MAX_COUNT = 10;

async function run() {
  try {
    const username = getRequiredInputValue('username')
      , host = getRequiredInputValue('bridge')
    ;

    const api = await getHueApi(host, username);

    const lightNames = getLightNames();
    const lights = await getLights(api, lightNames);

    const results = lights.map(light => {
      return {
        id: light.id,
        name: light.name,
        type: light.type,
        modelid: light.modelid
      }
    })

    core.setOutput('lights', results);
    await xmasDisco(api, lights.map(light => light.id));

  } catch (err) {
    core.setFailed(err.message);
  }
}

run();

function getRequiredInputValue(key) {
  return core.getInput(key, {required: true});
}

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

async function xmasDisco(api, lightIds) {
  let looping = true
    , count = 0
    , up = false
  ;

  let lightState = new LightState().on();
  await sendLightUpdate(api, lightState, ...lightIds);

  do {
    const lightState = new LightState().hue_inc(60);
    await sendLightUpdate(api, lightState, lightIds);

    count++;
    up = !up;
    if (count > MAX_COUNT) {
      looping = false;
    }

    await sleep(500);
  } while (looping);

  lightState = new LightState().off();
  await sendLightUpdate(api, lightState, ...lightIds);
}

async function sendLightUpdate(api, state, ...ids) {
  const promises = [];

  ids.forEach(id => {
    promises.push(api.lights.setLightState(id, state));
  });

  return Promise.all(promises);
}

async function sleep(timeMs) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function getHueApi(host, username) {
  return v3.api.createLocal(host).connect(username)
}