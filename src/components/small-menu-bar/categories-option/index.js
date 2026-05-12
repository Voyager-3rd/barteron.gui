export default {
	name: "CategoriesOption",

	inject: ["dialog", "categorySelectDialog"],

	computed: {
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

		selected(id) {
			this.$router.push({
				name: "category",
				params: { id }
			}).catch(e => {
				console.error(e);
				this.showVersionConflictIfNeeded(e);
			});
		},
	},
}