var count = 0
x: for (var i = 0; i < 10; i++) {
  for (var b of [ '4', '5', '6' ]) {
    count++
    void b
    break x
  }
}
module.exports = count
