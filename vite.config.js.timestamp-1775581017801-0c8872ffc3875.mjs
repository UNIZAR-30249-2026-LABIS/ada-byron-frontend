// vite.config.js
import { defineConfig } from "file:///C:/Users/Miguel1720/Desktop/Uni/4_informatica/2_cuatri/LabIngSoft/Proyecto/ada-byron-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Miguel1720/Desktop/Uni/4_informatica/2_cuatri/LabIngSoft/Proyecto/ada-byron-frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/Miguel1720/Desktop/Uni/4_informatica/2_cuatri/LabIngSoft/Proyecto/ada-byron-frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      },
      "/hubs": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true
      },
      "/geoserver": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.js"],
    include: ["src/tests/**/*.{test,spec}.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNaWd1ZWwxNzIwXFxcXERlc2t0b3BcXFxcVW5pXFxcXDRfaW5mb3JtYXRpY2FcXFxcMl9jdWF0cmlcXFxcTGFiSW5nU29mdFxcXFxQcm95ZWN0b1xcXFxhZGEtYnlyb24tZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1pZ3VlbDE3MjBcXFxcRGVza3RvcFxcXFxVbmlcXFxcNF9pbmZvcm1hdGljYVxcXFwyX2N1YXRyaVxcXFxMYWJJbmdTb2Z0XFxcXFByb3llY3RvXFxcXGFkYS1ieXJvbi1mcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTWlndWVsMTcyMC9EZXNrdG9wL1VuaS80X2luZm9ybWF0aWNhLzJfY3VhdHJpL0xhYkluZ1NvZnQvUHJveWVjdG8vYWRhLWJ5cm9uLWZyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIHJlYWN0KCksXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXG4gICAgXSxcblxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiA1MTczLFxuICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJy9odWJzJzoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdzOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICcvZ2Vvc2VydmVyJzoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgdGVzdDoge1xuICAgICAgICBnbG9iYWxzOiB0cnVlLFxuICAgICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgICAgc2V0dXBGaWxlczogWycuL3NyYy90ZXN0cy9zZXR1cC5qcyddLFxuICAgICAgICBpbmNsdWRlOiBbJ3NyYy90ZXN0cy8qKi8qLnt0ZXN0LHNwZWN9Lntqcyxqc3h9J10sXG4gICAgICAgIGNvdmVyYWdlOiB7XG4gICAgICAgICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgICAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnbGNvdiddLFxuICAgICAgICB9LFxuICAgIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2ZCxTQUFTLG9CQUFvQjtBQUMxZixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2hCO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDSCxRQUFRO0FBQUEsUUFDSixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDbEI7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLElBQUk7QUFBQSxNQUNSO0FBQUEsTUFDQSxjQUFjO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDbEI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBRUEsTUFBTTtBQUFBLElBQ0YsU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWSxDQUFDLHNCQUFzQjtBQUFBLElBQ25DLFNBQVMsQ0FBQyxxQ0FBcUM7QUFBQSxJQUMvQyxVQUFVO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxNQUFNO0FBQUEsSUFDN0I7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
