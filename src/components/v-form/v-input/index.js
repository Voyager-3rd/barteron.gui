export default {
	name: "Vinput",

	props: {
		id: { type: [String, Array], default: () => [] },
		name: { type: [String, Array], default: () => [] },
		type: { type: [String, Array], default: () => [] },
		min: { type: [Number, String, Array], default: () => [] },
		max: { type: [Number, String, Array], default: () => [] },
		placeholder: { type: [String, Array], default: () => [] },
		value: { type: [String, Array], default: () => [] }
	},

	data() {
		return {
			inputs: this.getInputs([this.id, this.name, this.type, this.placeholder, this.value])
		}
	},

	methods: {
		/**
		 * Convert String to Array
		 * 
		 * @param {String} param
		 */
		toArray(param) {
			return Array.isArray(param) ? param : [param];
		},

		/**
		 * Build input list from props
		 * 
		 * @param {Array} inputs 
		 * @return {Object[]}
		 */
		getInputs(inputs) {
			const input = Object.keys(this.$props).reduce((o, p) => {
				o[p] = this.toArray(this[p]);

				return o;
			}, {});

			return inputs
				.map(m => this.toArray(m))
				.sort((a, b) => a.length > b.length ? -1 : (a.length < b.length ? 1 : 0))[0]
				.reduce((a, v, i) => {
					a.push(
						/* Generate input keys */
						Object.keys(input).reduce((o, k) => {
							if (k === "type") o[k] = this.getType(input[k][i] ?? input[k][input[k].length - 1]);
							else if (["min", "max"].includes(k)) o[k] = input[k][i] ?? input[k][input[k].length - 1];
							else o[k] = input.placeholder[i] ?? null
	
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
		 * @return {String}
		 */
		getType(type) {
			switch(type) {
				case "minmax": return "number";
				default: return type;
			}
		}
	},

	mounted() {
		console.log(this.inputs)
	},
}