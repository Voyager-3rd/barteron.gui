export default {
	name: "VotingModeration",

	computed: {
		offer() {
			return this.sdk.barteron.offers[this.$route.query?.offer];
		},
	},

}