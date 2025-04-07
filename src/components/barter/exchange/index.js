import SelectOfferDialog from "@/views/Barter/SelectOfferDialog/index.vue";
import Vue from 'vue';

export default {
	name: "BarterExchange",

	components: {
		SelectOfferDialog,
	},

	props: {
		item: Object,
	},

	data() {
		return {
			selected: null,
			items: [],
			isLoading: false,
			purchaseState: "startPurchase",
			// groupExchange: []
		}
	},

	inject: ['dialog', 'lightboxContainer'],

	computed: {
		/**
		 * Get author address
		 * 
		 * @returns {String}
		 */
		address() {
			return this.item?.address;
		},

		/**
		 * Check if delivery options available
		 * 
		 * @returns {Boolean}
		 */
		deliveryOptionsAvailable() {
			const options = this.item?.delivery?.deliveryOptions || {};
			return (options.pickupPoints?.isEnabled || options.selfPickup?.isEnabled);
		},

	},

	methods: {
		/**
		 * Create room and send message
		 * 
		 * @param {Offer} offer
		 * @param {Object} options
		 */
		createRoom(offer, options = {}) {
			if (this.sdk.willOpenRegistration()) return;

			let needCreateRoom = true;

			const data = {
				name: offer.caption,
				members: [this.address],
				messages: [this.sdk.appLink(`barter/${ offer.hash }`)],
				openRoom: true,
			};

			if (this.deliveryOptionsAvailable && options?.isPurchase) {
				const option = this.sdk.barteron.offers[offer.hash]?.selectedDeliveryOption;
				if (option?.isSelfPickup) {
					data.messages.push(this.$t("deliveryLabels.chat_message_self_pickup_selected"));
				} else if (option?.hash) {
					const 
						address = option.address,
						hash = option.hash;
					
					if (address && hash) {
						if (!(data.members.includes(address))) {
							data.members.push(address);
						}
						data.messages.push(this.sdk.appLink(`barter/${ hash }`));
						data.messages.push(this.$t("deliveryLabels.chat_message_pickup_point_selected"));
					}
				} else {
					needCreateRoom = false;
					this.purchaseState = "goToPickupPointList";
				}
			}
			
			if (!(needCreateRoom)) return;

			this.isLoading = true;
			this.dialog?.instance.view("load", this.$t("dialogLabels.opening_room"));
			this.sendMessage(data).then(() => {
				this.dialog?.instance.hide();
			}).catch(e => {
				this.showError(e);
			}).finally(() => {
				this.isLoading = false;
			});
		},

		/**
		 * Select your offer to propose exchange seller's offer
		 */
		selectOffer() {
			var ComponentClass = Vue.extend(SelectOfferDialog);
			var instance = new ComponentClass({
				propsData: {
					item: this.item,
					items: this.items,
				}
			});
			
			instance.$on('onSelect', vm => {
				this.selected = vm.selected;
				this.proposeExchange();
			});

			instance.$mount();
			this.lightboxContainer().appendChild(instance.$el);
			instance.show();
		},

		/**
		 * Propose exchange your offer to seller's offer
		 */
		proposeExchange() {
			this.createRoom(this.items[this.selected]);
		},

		/**
		 * Start purchase
		 */
		startPurchase() {
			this.createRoom(this.item, {isPurchase: true});
		},

		/**
		 * Go to pickup point list
		 */
		goToPickupPointList() {
			this.scrollToElement("#pickup-point-list", { block: "center" });
		},

		selectedDeliveryOptionChanged() {
			if (this.deliveryOptionsAvailable && this.item?.hash) {
				const option = this.sdk.barteron.offers[this.item?.hash]?.selectedDeliveryOption;
				if (option) {
					this.purchaseState = "pickupPointSelected";
				}
			};
		},

		buyAtPickupPoint() {
			this.startPurchase();
		},
	},

	async mounted() {
		/* this.groupExchange = await this.sdk.getBrtOfferDeals({
			offer: this.item.hash,
			address: this.sdk.address
		}); */

		try {
			this.items = await this.sdk.getBrtOffers();
		} catch (e) {
			console.error(e);
		}
	}
}