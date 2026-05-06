import i18n from "@/i18n/index.js";
import Score from "@/components/score/index.vue";

export default {
	name: "ModerationRequestDialog",

	components: {
		Score,
	},

	i18n,

	props: {
		score: {
			type: Number,
			required: true
		},
	},

	data() {
		return {
			lightbox: false,
		}
	},

	computed: {
	},

	methods: {
		show() {
			this.$nextTick(() => {
				requestAnimationFrame(() => {
					this.lightbox = true;
					this.$emit("onShow", this);

					this.$nextTick(() => {
						this.$refs.reason?.setFocus();
					});
				});
			});
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
			this.$el.parentNode?.removeChild(this.$el);			
		},

		// TODO: moderationRequestLabels - need translation !!!!!!!!!!!!!!!!!!!!!!
		// TODO: add link preview in chat

		async submit() {
			const
				form = this.$refs.form,
				reason = this.$refs.reason;

			await reason?.trimContentAsync();

			const formData = form.serialize();

			if (form.validate()) {
				const requestData = {
					score: this.score,
					reason: formData.reason,
				};
				this.$emit("onSubmit", requestData);
			};
		}
	},
}