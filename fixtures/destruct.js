
const [ a = 1, b = 2, c = 3 ] = [ 4, 5 ]

const data = {
  screen_name: 'dtinth',
  status: 'Cool!'
}

const {
  screen_name = 'no_name',
  user_name = 'No Name',
  status
} = data
