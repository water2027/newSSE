// interface Events {

// }

// type Listener<T> = (arg: T) => void

// class EventBus {
//   private _listeners: {
//     [K in keyof Events]?: Set<Listener<Events[K]>>
//   } = {}

//   public on<K extends keyof Events>(eventName: K, listener: Listener<Events[K]>) {
//     if(!this._listeners[eventName]) {
//         this._listeners[eventName] = new Set<Listener<Events[K]>>()
//     }
//     this._listeners[eventName].add(listener)
//   }

//   public emit<K extends keyof Events>(eventName: K, arg: Events[K]) {
//     const listeners = this._listeners[eventName]
//     if(!listeners) return
//     try {
//         for(const listener of listeners) {
//             listener(arg)
//         }
//     } catch (error) {
//         console.error(error)
//     }
//   }
// }

// export default new EventBus()
