import i18n from "@/i18n/index.js";
import BarterItem from "@/components/barter/item/details/index.vue";

export default {
	name: "SelectPickupPointDialog",

	components: {
		BarterItem,
	},

	i18n,

	props: {
		item: {
			type: Object,
			default: () => ({})
		},
		isSelected: {
			type: Boolean,
			default: false
		},
		mode: {
			type: String,
			required: true
		},
		actionButtonI18nKeys: {
			type: Object,
			default: () => ({
				regular: "select",
				isSelected: "cancel",
			})
		},
	},

	data() {
		return {
			lightbox: false,
		}
	},

	methods: {
		show() {
			this.lightbox = true;
			this.$emit("onShow", this);
		},

		hide() {
			this.lightbox = false;
			setTimeout(() => {
				this.$emit("onHide", this);
				this.remove();
			}, 300);
		},

		dialogAction() {
			this.$emit("onDialogAction", this);
			this.hide();
		},

		remove() {
			this.$destroy();
			this.$el.parentNode.removeChild(this.$el);			
		}
	},
}