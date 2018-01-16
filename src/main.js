import mitt from 'mitt'
import raf from 'raf-throttle'

export default () => {
	const events = mitt()
	const style = window.getComputedStyle(document.body, ':after')
	const getCurrentBreakpoint = () =>
		style.getPropertyValue('content').replace(/'|"/g, '')

	let width = window.innerWidth
	let height = window.innerHeight
	let ratio = width / height
	let handle
	let last
	let query = getCurrentBreakpoint()

	const update = () => {
		width = window.innerWidth
		height = window.innerHeight
		ratio = width / height

		return { width, height, ratio }
	}

	const once = (arg, fn) => {
		if (once.value === arg) return
		fn(arg)
		once.value = arg
	}

	const test = (breakpoint, match, unmatch) => {
		const state = window.matchMedia(breakpoint).matches
		state ? once(state, match) : once(state, unmatch)
	}

	const dispatch = () =>
		requestAnimationFrame(() => {
			update()
			query = getCurrentBreakpoint()

			events.emit('view:resize', { width, height, query, ratio })

			if (last !== query) {
				events.emit('view:change', { width, height, query, ratio })
				last = query
			}
		})

	const at = (breakpoint, { match = () => {}, unmatch = () => {} }) => {
		test(breakpoint, match, unmatch)

		events.on('view:resize', () => {
			test(breakpoint, match, unmatch)
		})
	}

	const start = () => {
		handle = raf(dispatch)
		window.addEventListener('resize', handle, false)
	}

	const destroy = () => {
		window.removeEventListener('resize', handle, false)
		handle.cancel()
	}

	return {
		...events,
		width,
		height,
		at,
		start,
		destroy,
		update
	}
}
