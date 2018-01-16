# Mellow resize events

## Install

`npm install spon-resize` or `yarn add spon-resize`

```
import resizer from 'spon-resize'

const screen = resizer()

console.log(screen.width, screen.height)

screen.start()

screen.at(
  '(min-width: 400px)',
  () => console.log('match'),
  () => console.log('fail')
)

screen.on('view:change', (...args) => {
	console.log('change', args)
})

screen.on('resize',  (...args) => {
	console.log('resize', args)
})

screen.destroy()
```
