<script>
import { ref, onMounted } from "vue";
import { LMap, LTileLayer } from "../../../../node_modules/vue-leaflet/vue-leaflet";
import "leaflet-routing-machine";
import L from "leaflet";
import counterpartyApi from "../../../api/list/counterparty";
import { useRoute } from 'vue-router';

export default {
  name: "MapComponent",
  components: {
    LMap,
    LTileLayer,
  },
  setup() {
    const map = ref(null);
    const route = useRoute();
    const zoom = ref(3);
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution =
      '&copy; <a href="https://routing.openstreetmap.de/about.html">OpenStreetMap</a> contributors';
    const locations = ref([]);

    const getLocation = async () => {
      try {
        const { data: { result } } = await counterpartyApi.getLocation(route.params.id);
        console.log(result);
        locations.value = result.map((location) => [
          location.location.lat,
          location.location.lon,
        ]);
        setTimeout(() => {
          calculateRoutes();
        }, 1000);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    const createLocation = async () => {
      try {
        const body = {
          location: {
            lat: 40.305437,
            lon: 69.649052,
          },
          date: "2024-04-04 12:12:12",
        };
        const response = await counterpartyApi.createLocation(body);
        console.log(response);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    const calculateRoutes = () => {
      const mapInstance = map.value.leafletObject;
      if (!mapInstance) {
        console.error("Map object is not initialized yet.");
        return;
      }

      const routingControl = L.Routing.control({
        waypoints: locations.value.map((loc) => L.latLng(loc[0], loc[1])),
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        createMarker: function (i, waypoint) {
          const marker = L.marker(waypoint.latLng, {
            draggable: false,
          });
          marker.bindPopup(`Маршрут: ${i}`).openPopup();
          return marker;
        },
        lineOptions: { styles: [{ color: "#6FA1EC", weight: 4 }] },
        show: false,
      }).addTo(mapInstance);
    };

    onMounted(() => {
      getLocation();
      // createLocation();
    });

    return {
      map,
      zoom,
      tileUrl,
      attribution,
    };
  },
};
</script>

<template>
  <div style="position: relative;">
    <l-map
      ref="map"
      :zoom="zoom"
      :center="[46.41322, 41.219482]"
      style="height: 100vh"
    >
      <l-tile-layer :url="tileUrl" :attribution="attribution"></l-tile-layer>
    </l-map>
    <div style="position: absolute; z-index: 9999;">
      <v-btn>qdegregf</v-btn>
    </div>
  </div>
</template>
