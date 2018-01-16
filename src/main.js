import mitt from 'mitt'
import raf from 'raf-throttle'

export default () => {
	const events = mitt()
	const style = window.getComputedStyle(document.body, ':after')
	const getCurrentBreakpoint = () =>
		style.getPropertyValue('content').replace(/'|"/g, '')

	let width = window.innerWidth
	let height = window.innerHeight
	let handle
	let last
	let query = getCurrentBreakpoint()

	const update = () => {
		width = window.innerWidth
		height = window.innerHeight

		return { width, height }
	}

	const once = (arg, fn) => {
		if (once.value === arg) return
		fn(arg)
		once.value = arg
	}

	const match = (breakpoint, match, unmatch) => {
		const state = window.matchMedia(breakpoint).matches
		state ? once(state, match) : once(state, unmatch)
	}

	const dispatch = () =>
		requestAnimationFrame(() => {
			update()
			query = getCurrentBreakpoint()

			if (last !== query) {
				events.emit('view:change', { width, height, query })
				last = query
			}

			events.emit('view:resize', { width, height })
		})

	const at = (breakpoint, { match = () => {}, unmatch = () => {} }) => {
		match(breakpoint, match, unmatch)

		events.on('view:resize', () => {
			match(breakpoint, match, unmatch)
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
