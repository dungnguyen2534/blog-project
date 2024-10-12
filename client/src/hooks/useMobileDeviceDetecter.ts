export default function useMobileDeviceDetecter() {
  let isMobile = false;
  if (typeof window !== "undefined") {
    isMobile = window.matchMedia("(max-width: 640px)").matches;
  }
  return isMobile;
}
