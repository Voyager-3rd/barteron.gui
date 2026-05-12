export default {
	name: "CategoryField",

	inject: ["categorySelectDialog"],

	props: {
		name: {
			type: String,
			default: "category"
		},

		value: {
			type: [Number, String],
			default: null
		}
	},

	data() {
		return {
			id: null,
			dialogVisible: false,
		}
	},

	computed: {
		/**
		 * Get category parents
		 * 
		 * @returns {Array}
		 */
		catParents() {
			return this?.id ? this.categories.getParentsById(this.id) : [];
		}
	},

	methods: {
		showCategorySelectDialog() {
			const dialog = this.categorySelectDialog({
				marked: [this.id],
				value: this.id,
				mode: "offer",
			});

			dialog.$once("selected", (id) => {
				this.selected(id);
			});

			dialog.$once("onShow", () => {
				this.dialogVisible = true;
			});

			dialog.$once("onHide", () => {
				this.dialogVisible = false;
			});

			dialog.show();
		},

		/**
		 * Clear field
		 */
		clear() {
			this.id = null;
		},

		/**
		 * Selected category id from lightbox
		 * 
		 * @param {Number} id
		 */
		selected(id) {
			this.id = id;
		}
	},

	watch: {
		/**
		 * Watch for value changes
		 * 
		 * @param {Number|String} id
		 */
		value(id) {
			this.id = id;
		}
	},

	mounted() {
		if (this.value) this.id = this.value;
	}
}