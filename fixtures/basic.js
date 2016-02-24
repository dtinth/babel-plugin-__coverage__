
function run () {
  for (var i = 0; i < 10; i++) {
    if (i % 2 === 0) console.log('Hello world!')
    else console.log('Yeah!')
  }
  if (i === 10) console.log('wow')
  if (i === 0) console.log('wow')
}

function counter (state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + (42 ? 2 : 3) - (1 || 0) + (0 && 1) + a(2 && 0, 0 || 0)
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

const a = (x, y) => x + y
const b = (x, y) => x - y

run()
console.log((c => c(0, { type: 'INCREMENT' }))(counter))

void b
