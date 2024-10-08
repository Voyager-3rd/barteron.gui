import Vue from "vue";
import Offer from "./offer.vue";

export default {
	name: "Content",

	components: {
		Offer
	},

	data() {
		return {
			deals: []
		}
	},

	methods: {
		/**
		 * Create room and send message
		 * 
		 * @param {@Offer} offer
		 */
		createRoom(offer) {
			this.sendMessage({
				name: this.$t("buttonLabels.group_exchange"),
				members: [offer.address, offer.target.address],
				messages: [this.sdk.appLink(`barter/search?source=${ offer.source.hash }&target=${ offer.target.hash }`)],
				openRoom: true
			});
		}
	},

	async beforeRouteEnter (to, from, next) {

		let deals = [];

		try {

		const
			sdk = Vue.prototype.sdk,
			source = await sdk.getBrtOffersByHashes([to.query?.source]).then(result => result?.pop()),
			dealsResult = await sdk.getBrtOfferComplexDeals({
				myTag: source?.tag,
				theirTags: await sdk.getTheirTags(source),
				excludeAddresses: [source?.address]
			}).then(offers => {
				return offers?.reduce((result, match) => {
					if (match?.intermediates) {
						match.intermediates.forEach(offer => {
							offer.update({ source, target: match.target });
							result.push(offer);
						});
					}
	
					return result;
				}, []);
			});

			deals = dealsResult;

		} catch (e) {
			console.error(e);
		}

		/* Pass data to instance */
		next(vm => {
			vm.deals = deals;
		});
	}
}