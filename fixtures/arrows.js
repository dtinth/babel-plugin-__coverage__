
const arrow = a => (
  b => (
    c => (
      d => a + b + c + d
    )
  )
)

arrow(1)(2)
