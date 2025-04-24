import Vue from "vue";

export default {
	name: "Vinput",

	props: {
		id: { type: [String, Array], default: () => [] },
		name: { type: [String, Array], default: () => [] },
		type: { type: [String, Array], default: () => [] },
		readonly: { type: [String, Array], default: () => [] },
		disabled: { type: [Boolean, Array], default: () => [] },
		step: { type: [Number, String, Array], default: () => [] },
		min: { type: [Number, String, Array], default: () => [] },
		max: { type: [Number, String, Array], default: () => [] },
		placeholder: { type: [String, Array], default: () => [] },
		list: { type: [String, Array], default: () => [] },
		value: { type: [Number, String, Array], default: () => [] },
		
		vEvents: { type: Object, default: () => ({}) },
		vSize: String,
	},

	data() {
		return {
			inputs: [],
			exclude: ["vEvents", "vSize"],
			counter: null
		}
	},

	computed:{
		/**
		 * Make object with inputs attributes
		 * 
		 * @returns {Object[]}
		 */
		attrs() {
			const data = Object.keys(this.$props).filter(e => !this.exclude.includes(e));

			return Vue.observable(
				this.getAttrs(data, data.map(prop => this.$props[prop]))
			);
		}
	},

	methods: {
		/**
		 * Convert String to Array
		 * 
		 * @param {String} param
		 * 
		 * @returns {Array}
		 */
		toArray(param) {
			return Array.isArray(param) ? param : [param];
		},

		/**
		 * Build input list from props
		 * 
		 * @param {Array} inputs
		 * 
		 * @returns {Object}
		 */
		getAttrs(keys, values) {
			const props = keys.reduce((o, p) => {
				o[p] = this.toArray(this[p]);

				return o;
			}, {});

			return values
				.map(m => this.toArray(m))
				.sort((a, b) => a.length > b.length ? -1 : (a.length < b.length ? 1 : 0))[0]
				.reduce((a, v, i) => {
					a.push(
						/* Generate input keys */
						keys.reduce((o, k) => {
							if (k === "type") o[k] = this.getType(props[k][i] ?? props[k][props[k].length - 1]);
							else if (["min", "max"].includes(k)) o[k] = props[k][i] ?? props[k][props[k].length - 1];
							else o[k] = props[k][i] ?? null
	
							return o;
						}, {})
					);

					return a;
				}, []);
		},

		/**
		 * Get input type
		 * 
		 * @param {String}
		 * 
		 * @returns {String}
		 */
		getType(type) {
			switch(type) {
				case "minmax": return "number";
				default: return type;
			}
		},

		/**
		 * Increment input value
		 */
		increment(index) {
			const
				max = (this.attrs[index]?.max || null),
				step = Number(this.attrs[index]?.step || 1),
				input = this.inputs[index];

			if (max && this.attrs[index].value < max) {
				this.attrs[index].value += step;
				input.value = this.attrs[index].value;
				input.dispatchEvent(new Event("change"));
			}
		},

		/**
		 * Decrement input value
		 */
		decrement(index) {
			const
				min = (this.attrs[index]?.min || 0),
				step = (this.attrs[index]?.step || 1),
				input = this.inputs[index];

			if (this.attrs[index].value > min) {
				this.attrs[index].value -= step;
				input.value = this.attrs[index].value;
				input.dispatchEvent(new Event("change"));
			}
		},

		/**
		 * MouseDown handler
		 * 
		 * @param {Function} fn
		 * @param {Number} fr
		 */
		mouseDown(fn, fr) {
			clearInterval(this.counter);
			this.counter = setInterval(fn, fr || 100);
		},

		/**
		 * MouseDown handler
		 */
		mouseUp() {
			clearInterval(this.counter);
			this.counter = null;
		}
	},

	mounted() {
		/* Create real-time computed property */
		this.inputs = new Proxy(this.$refs.fields, {
			get(target, index) {
				return target?.[index];
			}
		});
	}
}