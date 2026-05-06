import Profile from "@/components/profile/index.vue";

export default {
	name: "Aside",

	components: {
		Profile,
	},

	data() {
		return {
			isLoaded: false,
		}
	},

	computed: {
		content() {
			return this.isLoaded ? this.$components.content : null;
		},

		userAddress() {
			return this.content?.userAddress;
		},

		moderatorAddress() {
			return this.content?.moderatorAddress;
		},

		isModerator() {
			return this.content?.isModerator;
		},
	},

	methods: {
		openVotingModerationRoom() {
			this.content?.openVotingModerationRoom();
		},
	},

	mounted() {
		this.$2watch("$components.content").then(() => {
			this.isLoaded = true;
		}).catch(e => {
			console.error(e);
		});
	}
}