export default {
	name: "BarterExchange",

	computed: {
		mainComponent() {
			return this.isLoaded ? this.$components.content?.$refs.barterItem : null;
		},
	},

	data() {
		return {
			isLoaded: false,
		}
	},

	methods: {
		purchaseState() {
			return this.mainComponent?.purchaseState;
		},

		exchangeAvailable() {
			return this.mainComponent?.exchangeAvailable;
		},

		isChatLoading() {
			return this.mainComponent?.isChatLoading;
		},

		selectOffer() {
			this.mainComponent?.selectOfferToExchange?.();
		},

		startPurchase() {
			this.mainComponent?.startPurchase?.();
		},

		goToPickupPointList() {
			this.mainComponent?.goToPickupPointList?.();
		},

		buyAtSelectedPickupPoint() {
			this.mainComponent?.buyAtSelectedPickupPoint?.();
		},
	},

	mounted() {
		this.$2watch("$components.content?.$refs.barterItem").then(() => {
			this.isLoaded = true;
		});
	}
}