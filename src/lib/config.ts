// Global Application Config

// Set to true to activate the luxury Maintenance / Under Construction screen
// Set to false or use process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" to open the live menu
export const IS_MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "false";
