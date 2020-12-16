let loop = true
  , count = 0
;

while (loop) {
  console.log(getRandomIndex(0, 2));

  count++;
  if (count > 100) {
    loop = false;
  }
}


function getRandomIndex(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}
