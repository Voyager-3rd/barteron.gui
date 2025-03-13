import Loader from "@/components/loader/index.vue";
import PickupPointItem from "@/components/pickup-point/item/index.vue";
import { Carousel, Slide } from "@/components/vue-snap/index.js";
import "@/components/vue-snap/vue-snap.css";

export default {
	name: "PickupPointList",

	components: {
		Loader,
		PickupPointItem,
		Carousel,
		Slide
	},

	props: {
		items: {
			type: Array,
			default: () => []
		},
		mode: {
			type: String,
			required: true
		},
		holderClass: String,
		loaderState: Boolean,
		loaderItems: {
			type: Number,
			default: 4
		},
	},

	methods: {
		unselectItem(offer) {
			this.$emit("unselectItem", offer);
		},

		validatedValue() {
			return !!(this.items?.length);
		},
	}
}