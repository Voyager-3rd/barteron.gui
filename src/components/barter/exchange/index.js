export default {
	name: "BarterExchange",

	computed: {
		mainComponent() {
			return this.$components.content?.$refs.barterItem;
		},
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
}