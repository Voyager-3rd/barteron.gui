import i18n from "@/i18n/index.js";
import router from "@/router.js";
import Profile from "@/components/profile/index.vue";
import Score from "@/components/score/index.vue";

export default {
	name: "OfferScoresDialog",

	i18n,

	router,

	components: {
		Profile,
		Score,
	},

	props: {
		items: {
			type: Array,
			default: () => []
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

		remove() {
			this.$destroy();
			this.$el.parentNode.removeChild(this.$el);
		},
	},

	watch: {
		$route() {
			if (this.lightbox) {
				this.hide();
			}
		}
	},
}