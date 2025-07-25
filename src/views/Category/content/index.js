import Loader from "@/components/loader/index.vue";
import BarterList from "@/components/barter/list/index.vue";
import offerStore, { useOfferStore } from "@/stores/offer.js";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useLocaleStore } from "@/stores/locale.js";

function setValueToVSelect(ref, value) {
	const
		items = ref?.items || [],
		targetItem = items.filter(item => item.value === value)[0];

	if (targetItem) {
		ref.setValue(targetItem);
	}
}

function getOrderFromString(value) {
	const state = (value || "").split("_");

	return {
		orderBy: state[0] ?? "height",
		orderDesc: state[1] === "desc"
	};
}

export default {
	name: "Content",

	components: {
		Loader,
		BarterList
	},

	inject: ["dialog"],

	computed: {
		...mapState(useOfferStore, [
			"items",
			"itemsRoute",
			"pageStart",
			"isLoading",
			"bartersView",
		]),

		...mapWritableState(useOfferStore, [
			"scrollOffset",
			"currentError",
		]),

		...mapState(useOfferStore, [
			"pageSize",
		]),

		...mapState(useLocaleStore, [
			"locale",
		]),

		/**
		 * Make list of order by
		 * 
		 * @returns {Array}
		 */
		orders() {
			return this.parseLabels("orderLabels");
		},

		/**
		 * Make list of view
		 * 
		 * @returns {Array}
		 */
		views() {
			return this.parseLabels("viewLabels");
		},

		/**
		 * All items of the list are loaded
		 * 
		 * @returns {Boolean}
		 */
		allItemsAreLoaded() {
			return (this.items.length < (this.pageStart + 1) * this.pageSize)
		},

	},

	methods: {
		...mapActions(useOfferStore, [
			"loadFirstPage",
			"loadMore",
			"changeOrder",
			"changeView",
			"changeFilters",
			"getFilters"
		]),

		showMoreEvent() {
			this.loadMore(this.$route);
		},

		selectOrderEvent(newValue) {
			const newOrder = getOrderFromString(newValue?.value);
			this.changeOrder(newOrder, this.$route);
		},

		selectViewEvent(newValue) {
			this.changeView(newValue?.value);
		},

		/**
		 * Apply filters
		 * 
		 * @param {Object} newValue
		 */
		applyFilters(newValue) {
			this.changeFilters(newValue, this.$route)
		},

		/**
		 * Get order string from filter
		 * 
		 * @returns {String}
		 */
		getOrderStringFromFilter() {
			const
				filters = this.getFilters(),
				orderBy = filters.orderBy ?? "height",
				orderArrow = filters.orderDesc ? "desc" : "asc";
				
			return `${orderBy}_${orderArrow}`;
		},

		/**
		 * Set order value to element
		 */
		setOrderValueToElement() {
			const value = this.getOrderStringFromFilter();
			setValueToVSelect(this.$refs.order, value);
		},

		/**
		 * Set barters view to element
		 */
		setBartersViewToElement() {
			setValueToVSelect(this.$refs.bartersView, this.bartersView);
		},

		isEmptyListFromFullSearch() {
			return offerStore.isEmptyListFromFullSearch(this.$route);
		},

		/**
		 * Reset account location
		 */
		reset() {
			const canReset = (this.locationStore.bounds);
			if (canReset) {
				this.locationStore.reset({onlyBounds: true});
			} else {
				this.loadFirstPage(this.$route);
			};
		}
	},

	watch: {
		/**
		 * Watch for route change to preload items
		 * 
		 * @param {Object} to
		 * @param {Object} from
		 */
		async $route(to) {
			if (to?.name === "category") {
				await this.loadFirstPage(to);
			}
		},

		/**
		 * Watch for location change to preload items
		 */
		async "locationStore.bounds"() {
			await this.loadFirstPage(this.$route);
		},

		/**
		 * Watch for current error change to show dialog
		 */
		currentError() {
			if (this.currentError) {
				this.showError(this.currentError)
				this.currentError = null;
			}
		},

		locale() {
			this.$nextTick(() => {
				this.setOrderValueToElement();
				this.setBartersViewToElement();
			});
		},
	},

	mounted() {
		this.waitForRefs("order, bartersView").then(() => {
			this.setOrderValueToElement();
			this.setBartersViewToElement();
		}).catch(e => { 
			console.error(e);
		});
	},

	beforeRouteEnter (to, from, next) {
		next(async vm => {
			const
				isListEmpty = (vm.items.length == 0),
				isReturnFromOffer = (
					from.name == "barterItem" 
					&& to.fullPath === vm.itemsRoute?.fullPath
				),
				needReloadOffers = (isListEmpty || !(isReturnFromOffer));

			if (needReloadOffers) {
				await vm.loadFirstPage(to);
			}
		});
	},

	beforeRouteLeave(to, from, next) {
		const isEnterToOffer = (to.name == "barterItem");
		if (isEnterToOffer) {
			const el = document.body;
			this.scrollOffset = {x: el.scrollLeft, y: el.scrollTop};
		}
		next();
	},
}