const path = require('path')
  , core = require('@actions/core')
  , v3 = require('node-hue-api').v3
  , LightState = v3.lightStates.LightState
;

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

async function getHueApi(host, username) {
  return v3.api.createLocal(host).connect(username)
}