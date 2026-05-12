export default {
	name: "SearchBar",

	data() {
		return {
			query: this.$route.query.search || ""
		}
	},

	inject: ["dialog", "categorySelectDialog"],

	computed: {
		/**
		 * Category id
		 * 
		 * @returns {Number}
		 */
		id() {
			return this.$route.name === "category" && this.$route.params.id || "";
		}
	},

	methods: {
		showCategorySelectDialog() {
			const dialog = this.categorySelectDialog({
				marked: [this.id],
				value: this.id,
			});

			dialog.$once("selected", (id) => {
				this.selected(id);
			});

			dialog.show();
		},

		/**
		 * Selected category id from lightbox
		 * 
		 * @param {Number} id
		 */
		selected(id) {
			this.$router.push({
				name: "category",
				params: { id }
			}).catch(e => {
				console.error(e);
				this.showVersionConflictIfNeeded(e);
			});
		},

		/**
		 * Reset search query
		 */
		reset() {
			this.query = "";
		},

		/**
		 * Store search string in url query
		 */
		submit() {
			const
				to = {
					name: "category",
					params: { id: this.id || "search" },
					query: this.query ? { search: this.query } : {},
				},
				from = this.$route,
				needReplace = !(this.routesAreEqual(to, from, ['name', 'params', 'query']));

			if (needReplace) {
				this.$router.replace(to).catch(e => {
					console.error(e);
					this.showVersionConflictIfNeeded(e);
				});
			};
		},
	},

	watch: {
		async $route(to, from) {
			this.query = to.query.search || ""
		},

		query: {
			handler() {
				const queryReset = (!this.query && this.$route.query.search);
				if (queryReset) {
					this.submit()
				}
			}
		}
	}
}