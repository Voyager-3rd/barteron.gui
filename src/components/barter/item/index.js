import ImageLoad from "@/components/image-load/index.vue";
import Loader from "@/components/loader/index.vue";
import ExchangeList from "@/components/barter/exchange/list/index.vue";
import CurrencySwitcher from "@/components/currency-switcher/index.vue";
import LikeStore from "@/stores/like.js";

export default {
	name: "BarterItem",

	components: {
		ImageLoad,
		Loader,
		ExchangeList,
		CurrencySwitcher
	},

	props: {
		item: {
			type: Object,
			default: () => ({})
		},
		vType: {
			/* row, tile or item */
			type: String,
			default: "tile"
		},
		customLink: {
			type: [String, Object, Function],
			default: null
		}
	},

	data() {
		return {
			map: null,
			offersNear: [],
			hover: 0,
			active: 0,
			addr: {}
		}
	},

	computed: {
		/**
		 * Get owner account
		 * 
		 * @returns {@Account}
		 */
		ownerAccount() {
			return this.sdk.barteron.accounts[this.item.address];
		},
		
		/**
		 * Get exchange list
		 * 
		 * @returns {Array}
		 */
		exchangeList() {
			let ids = this.item.tags;

			if (ids?.includes("my_list")) {
				ids = this.ownerAccount?.tags || [];
			} else if (ids?.includes("for_nothing")) {
				ids = [{ value: this.$t("barterLabels.free") }];
			}

			return this.ifEmpty(
				/* Values */
				ids?.map(id => {
					const category = this.categories.items[id];
	
					return {
						...category,
						value: this.$t(category?.name)
					}
				}).filter(c => c.id),

				/* Default if empty */
				[{ id: 99, value: this.$t("everything_else") }]
			);
		},

		/**
		 * Get user location
		 * 
		 * @returns {Array|null}
		 */
		location() {
			const geohash = this.locationStore.geohash;

			this.decodeGeoHash(geohash);
		},

		/**
		 * Decode offer geohash
		 * 
		 * @returns {Array|null}
		 */
		geohash() {
			return this.decodeGeoHash(this.item.geohash);
		},

		/**
		 * Get address from geohash
		 * 
		 * @returns {null|String}
		 */
		geopos() {
			if (!this.addr.country) {
				if (!this.addr.fetching && this.geohash) {
					this.addr.fetching = true;
				
					this.sdk.geoLocation(this.geohash, {
						"zoom": this.zoom || 18,
						"accept-language": this.$root.$i18n.locale
					}).then(result => {
						if (result?.address) this.$set(this, "addr", result.address);
					}).catch(e => { 
						console.error(e);
					}).finally(() => {
						this.addr.fetching = false;
					});
				}

				return null;
			} else {
				return [
					this.addr.country,
					this.addr.city || this.addr.town || this.addr.state || this.addr.county
				].filter(f => f).join(", ");
			}
		},

		/**
		 * Calculate distance from geohash to location
		 * 
		 * @returns {Number}
		 */
		distance() {
			const
				R = 6371, /* Radius of the earth in km */
				toRad = (value) => value * Math.PI / 180,
				lat1 = this.location?.[0],
				lon1 = this.location?.[1],
				lat2 = this.geohash?.[0],
				lon2 = this.geohash?.[1],
				destLat = toRad(lat2 - lat1),
				destLon = toRad(lon2 - lon1),
				radLat1 = toRad(lat1),
				radLat2 = toRad(lat2),
				a = Math.sin(destLat / 2) * Math.sin(destLat /2 ) + Math.sin(destLon / 2) * Math.sin(destLon / 2) * Math.cos(radLat1) * Math.cos(radLat2),
				c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

			return parseFloat((R * c).toFixed(1));
		},

		/**
		 * Customize offer link
		 * 
		 * @returns {Object|String}
		 */
		offerLink() {
			if (!this.customLink) {
				return { name: "barterItem", params: { id: this.item.hash } };
			} else if (typeof this.customLink === "function") {
				return this.customLink(this.item, this);
			} else {
				return this.customLink;
			}
		},

		/**
		 * Get like state
		 * 
		 * @returns {Boolean}
		 */
		hasLike() {
			return LikeStore.hasLike(this.item?.hash);
		},

		/**
		 * Show is offer has published
		 * 
		 * @returns {Boolean}
		 */
		hasRelay() {
			return this.item.relay;
		},

		/**
		 * Checking removed status
		 * 
		 * @returns {Boolean}
		 */
		isRemoved() {
			return this.item.status === "removed";
		},
	},

	methods: {
		/**
		 * Set like state
		 */
		setLike() {
			if (!(this.hasRelay || this.isRemoved)) {
				LikeStore.set(this.item?.hash);
			}
		},

		/**
		 * Share item
		 */
		shareItem() {
			if (!(this.hasRelay || this.isRemoved)) {
				const data = {
					path: `barter/${ this.item.hash }`,
					sharing: {
						title: this.$t("itemLabels.label"),
						text: { body: this.item.caption }
					}
				};
				this.sdk.share(data);
			}
		},

		/**
		 * Check return alternative if empty
		 * 
		 * @returns {*}
		 */
		ifEmpty() {
			for (let a in arguments) {
				const prop = arguments[a];
				if (prop?.length) return prop;
			}

			return arguments[arguments.length - 1];
		},

		imageZoom(e) {
			const
				picture = this.$refs.picture,
				holder = picture.querySelector("li.active"),
				image = holder?.querySelector("img");

			if (!image?.src) return;

			if (e.type !== "mouseleave") {
				holder.classList.add("zoom");
				holder.style.setProperty("--url", `url(${ image.src })`);

				/* Move */
				const
					rect = e.target.getBoundingClientRect(),
					xPos = e.clientX - rect.left,
					yPos = e.clientY - rect.top,
					xPercent = `${ xPos / (holder.clientWidth / 100) }%`,
					yPercent = `${ yPos / (holder.clientHeight / 100) }%`;
 
				Object.assign(holder.style, {
					backgroundPosition: `${ xPercent } ${ yPercent }`,
					backgroundSize: `${ (image.offsetWidth / 100) * 120 }px`
				});
			} else if(e.type === "mouseleave") {
				holder.classList.remove("zoom");
				holder.removeAttribute("style");
			}
		},

		/**
		 * Get offers feed
		 */
		async getOffersFeed() {
			const
				center = this.item.geohash,
				radius = this.defaultRadius;

			const offers = await this.getOffersFeedList(center, radius);
			
			this.offersNear = offers.map(offer => {
				if (this.vType === "page" && offer.hash === this.item.hash) {
					offer.current = true;
				}

				return offer;
			});
		}
	},

	mounted() {
		if (this.vType === "page") {
			this.$2watch("$refs.map").then(map => {
				this.map = map;
				this.getOffersFeed();
			}).catch(e => { 
				console.error(e);
			});
		}
	}
}