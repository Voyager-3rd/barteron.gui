import Vue from "vue";
import { Icon } from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import {
	LMap,
	LTileLayer,
	LMarker,
	LTooltip,
	LPopup,
	LCircle,
	LCircleMarker,
	LControl,
	LIcon
} from "vue2-leaflet";
import Vue2LeafletMarkerCluster from "vue2-leaflet-markercluster";
import LGeosearch from "vue2-leaflet-geosearch";
import BarterItem from "@/components/barter/item/index.vue";
import { mapState } from "pinia";
import { useLocaleStore } from "@/stores/locale.js";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
	iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
	iconUrl: require("leaflet/dist/images/marker-icon.png"),
	shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default {
	name: "Vmap",

	components: {
		LMap,
		LTileLayer,
		LMarker,
		LMarkerCluster: Vue2LeafletMarkerCluster,
		LTooltip,
		LPopup,
		LCircle,
		LCircleMarker,
		LControl,
		LIcon,
		LGeosearch,
		BarterItem
	},

	props: {
		id: {
			type: String,
			default: `map-${ Math.random().toString(16).slice(2) }`
		},
		height: {
			type: String,
			default: "350px"
		},
		width: {
			type: String,
			default: "100%"
		},
		url: {
			type: String,
			default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		},
		attribution: {
			type: String,
			default: "&copy; <a target='_blank' href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
		},
		center: {
			type: Array,
			default: () => [0, 0]
		},
		offers: {
			type: Array,
			default: () => []
		},
		mapMode: {
			type: String,
			default: "input"
		},
		zoom: {
			type: Number,
			default: 10
		},
		maxZoom: {
			type: Number,
			default: 18
		},
		mapActionData: {
			type: Object,
			default: () => ({})
		},
	},

	data() {
		return {
			offerIcon: this.imageUrl("offer.png"),
			offerIconActive: this.imageUrl("offer-active.png"),
			iconSize: [32, 37],
			mapObject: {},
			resizeObserver: null,
			geosearchOptions: this.getGeosearchOptions(),
			addressSearchEnabled: false,
			marker: (this.isInputMode ? this.center : null),
			scale: this.zoom,
			userLocationIsLoading: false,
			mapState: "",
			isLoading: false,
			offersSearchButton: false,
			offersLoadMoreButton: false,
			loadingError: false,
			loadingErrorMessage: "",
			foundOffers: [],
			geosearchForm: null,
		}
	},

	computed: {
		...mapState(useLocaleStore, ["locale"]),

		/**
		 * Checking that the map mode is search
		 * 
		 * @returns {Boolean}
		 */
		isSearchMode() {
			return this.mapMode === "search";
		},

		/**
		 * Checking that the map mode is view
		 * 
		 * @returns {Boolean}
		 */
		isViewMode() {
			return this.mapMode === "view";
		},

		/**
		 * Checking that the map mode is input
		 * 
		 * @returns {Boolean}
		 */
		isInputMode() {
			return this.mapMode === "input";
		},

		/**
		 * Get offers to show
		 * 
		 * @returns {Array}
		 */
		shownOffers() {
			return this.isSearchMode ? this.foundOffers : this.offers;
		},

		/**
		 * Get icon anchor
		 * 
		 * @returns {Array}
		 */
		iconAnchor() {
			const
				dx = (this.iconSize?.[0] || 0) / 2,
				dy = (this.iconSize?.[1] || 0);

			return [dx, dy];
		},

	},

	methods: {
		getGeosearchOptions() {
			return {
				provider: this.getMapProvider(),
				style: "bar",
				autoClose: true,
				searchLabel: this.$t("locationLabels.enter_address"),
				notFoundMessage: this.$t("locationLabels.address_not_found"),
			};
		},

		getMapProvider() {
			return new OpenStreetMapProvider({
				params: {
				  'accept-language': this.sdk.getLanguageByLocale(this.$root.$i18n.locale),
				  addressdetails: 1,
				},
			});
		},

		localeChanged() {
			Vue.set(this, "geosearchOptions", this.getGeosearchOptions());
		},

		observeResize() {
			const map = this.$refs.map;
			this.resizeObserver = new ResizeObserver(() => {
				this.mapObject.invalidateSize();
			});
			this.resizeObserver.observe(map.$el);
		},

		toggleAddressSearch(event, options = { forcedValue: null }) {
			const el = this.getGeosearchForm();
			if (el) {
				this.addressSearchEnabled = options?.forcedValue ?? !(this.addressSearchEnabled);
				el.style.visibility = this.addressSearchEnabled ? "visible" : "hidden";
			}
			event?.currentTarget?.blur();
		},

		getGeosearchForm() {
			if (!(this.geosearchForm)) {
				const parent = this.$refs.map.$el;
				this.geosearchForm = parent.querySelector("div.leaflet-control-geosearch.bar form");
			}
			return this.geosearchForm;
		},

		setupHandlers() {

			if (this.isViewMode) {
				this.setupViewModeHandlers();
			} else if(this.isInputMode) {
				this.setupInputModeHandlers();
			} else if (this.isSearchMode) {
				this.setupSearchModeHandlers();
			};

			/* this.mapObject
				.on("mousemove", e => {
					this.lastMousePos = e.originalEvent;
				})
				.on("zoom", () => {
					if (this.lastMousePos) {
						const latLng = this.mapObject.mouseEventToLatLng(this.lastMousePos);
						this.mapObject.setView(latLng, this.mapObject.getZoom());
					}
					console.log(this.mapObject)
				}); */
	
		},

		setupViewModeHandlers() {
			this.setToggleWheelByFocus();
		},

		setupInputModeHandlers() {
			this.setToggleWheelByFocus();

			const markerAtCenter = (emit, event) => {
				this.scale = this.mapObject.getZoom();
				this.marker = Object.values(
					this.mapObject.getCenter()
				);
				
				if (emit) {
					this.$emit("scale", this.scale, event);
					this.$emit("change", this.marker, event);
				}
			}

			this.mapObject
				.on("click", e => {
					if (e.originalEvent.target.matches("div.vue2leaflet-map")) {
						this.marker = Object.values(e.latlng);
						this.$emit("change", Object.values(e.latlng));
					}
				})
				.on("move", e => {
					if (e?.originalEvent) markerAtCenter(false, e);
				})
				.on("moveend", e => {
					markerAtCenter(true, e);
				});

			markerAtCenter(true);
		},

		setupSearchModeHandlers() {

			const moveEndHandler = (e) => {
				this.mapObject.off("moveend"); // prevent double moveend event bug

				this.scale = this.mapObject.getZoom();
				const center = Object.values(
					this.mapObject.getCenter()
				);

				this.$emit("scale", this.scale, e);
				this.$emit("change", center, e);
				this.$emit("bounds", this.mapObject.getBounds(), e);
			};

			this.mapObject.on("movestart", e => {
				this.$emit("mapAction", "moveMap", {}, e);

				this.mapObject.on("moveend", e => moveEndHandler(e));
			});

			this.mapObject.on("geosearch/showlocation", e => {
				this.$emit("geosearch_showlocation", e);
			});

		},

		setToggleWheelByFocus() {
			this.toggleWheel(false);

			this.mapObject
				.on("focus", () => this.toggleWheel(true))
				.on("blur", () => this.toggleWheel(false));
		},

		setupData() {
			if (this.isSearchMode) {
				this.changeStateTo("initialState");
			}
		},

		changeStateTo(newState) {
			this.mapState = newState;

			if (this.isSearchMode) {

				this.isLoading = false;
				this.offersSearchButton = false;
				this.offersLoadMoreButton = false;
				this.loadingError = false;

				switch (this.mapState) {
					case "initialState":
						this.offersSearchButton = true;
						break;
						
					case "readyForSearch":
						this.offersSearchButton = true;
						break;

					case "isLoading":
						this.isLoading = true;
						break;
					
					case "fullyLoaded":
						break;

					case "partiallyLoaded":
						this.offersLoadMoreButton = true;
						break;

					case "loadingError":
						this.loadingError = true;
						break;
	
					default:
						break;
				}
			}
		},

		mapActionDataChanged() {
			if (this.isSearchMode) {

				const res = this.mapActionData;

				const
					loadingStarted = res.isLoading,
					mapMoved = !(res.isLoading || res.offers || res.error),
					loadingCompleted = !(res.isLoading) && res.offers,
					loadingFailed = !(res.isLoading) && res.error;
				
				switch (this.mapState) {

					case "initialState":
						if (loadingStarted) {
							this.changeStateTo("isLoading");
						}
						break;

					case "readyForSearch":

						if (loadingStarted) {
							this.changeStateTo("isLoading");
						} else if (loadingCompleted) {
							this.showLoadedOffers();
						}
						break;

					case "isLoading":

						if (mapMoved) {
							this.changeStateTo("readyForSearch");
						} else if (loadingCompleted) {
							this.showLoadedOffers();
							if (res.nextPageExists) {
								this.changeStateTo("partiallyLoaded");
							} else {
								this.changeStateTo("fullyLoaded");
							}
						} else if (loadingFailed) {
							this.loadingErrorMessage = res.error?.message;
							this.changeStateTo("loadingError");
						}
						break;
					
					case "fullyLoaded":

						if (mapMoved) {
							this.changeStateTo("readyForSearch");
						}
						break;

					case "partiallyLoaded":

						if (mapMoved) {
							this.changeStateTo("readyForSearch");
						} else if (loadingStarted) {
							this.changeStateTo("isLoading");
						}
						break;

					case "loadingError":

						if (mapMoved) {
							this.changeStateTo("readyForSearch");
						}						
						break;
	
					default:
						break;
				}

			}
		},

		showLoadedOffers() {
			if (this.isSearchMode) {
				const res = this.mapActionData;
				if (res.isNextPage) {
					this.foundOffers = this.foundOffers.concat(res.offers);
				} else {
					this.foundOffers = res.offers;
				}
			}
		},

		startLocating() {
			if (this.userLocationIsLoading) {
				return;
			}

			this.userLocationIsLoading = true;
			this.sdk.requestUserLocation(true, true).then(result => {
				if (this.latLonDefined(result)) {
					this.scale = this.mapObject.getZoom();
					const minZoom = 12;
					this.mapObject.setView(
						result, 
						Math.max(this.scale, minZoom)
					);
				} else {
					throw new Error('Location data is not defined');
				}
			}).catch(e => {
				console.error(e);
				this.$emit("errorEvent", e);
			}).finally(() => {
				this.userLocationIsLoading = false;
			});
		},

		toggleWheel(enable) {
			this.mapObject.scrollWheelZoom[enable ? "enable" : "disable"]()
		},

		searchOffersEvent(e) {
			this.mapObject.closePopup();
			this.emitLoadingMapAction("loadData", e);
		},

		loadMoreOffersEvent(e) {
			this.mapObject.closePopup();
			this.emitLoadingMapAction("loadNextPage", e);
		},

		emitLoadingMapAction(actionName, e) {
			const actionParams = {
				bounds: this.mapObject.getBounds(),
			}
			this.$emit("mapAction", actionName, actionParams, e);
		},

		latLonDefined(latLon) {
			return latLon?.length && (latLon[0] || latLon[1]);
		},
	},

	mounted() {
		this.$2watch("$refs.map").then(map => {
			this.mapObject = map.mapObject;
			this.observeResize();
		}).then(() => {
			return this.latLonDefined(this.center) ? 
				this.center 
				: this.sdk.getDefaultLocation();
		}).catch(e => { 
			console.error(e);
		}).then(latLon => {
			const center = this.latLonDefined(latLon) ? latLon : [0, 0];
			const zoom = this.latLonDefined(latLon) ? this.zoom : 0;
			this.mapObject.setView(center, zoom);
		}).then(() => {
			const needShowAddressInput = (this.isSearchMode || this.isInputMode);
			this.toggleAddressSearch(null, {forcedValue: needShowAddressInput});
			this.setupHandlers();
			this.setupData();
		}).catch(e => { 
			console.error(e);
		});
	},

	watch: {
		locale() {
			this.localeChanged();
		},

		mapActionData: {
			deep: true,
			handler() {
				this.mapActionDataChanged();
			}
		}
	},

	beforeDestroy() {
		this.mapObject.off();
		this.resizeObserver?.disconnect();
	},
}