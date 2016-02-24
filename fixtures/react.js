
import React from 'react'
import ReactDOMServer from 'react-dom/server'

const App = React.createClass({
  propTypes: {
    side: React.PropTypes.string
  },
  render () {
    return <div>
      {this.props.side === 'dark' ? 'dark side' : 'light side'}
    </div>
  }
})

console.log(ReactDOMServer.renderToStaticMarkup(<App side='dark' />))
