import Redis from "ioredis";

const redisClient = new Redis(
  process.env.REDIS_URI || "redis://localhost:6379",{
  lazyConnect:true,
});

let isRedisConnected = false;

redisClient.on("connect", () => {
  isRedisConnected = true;
  console.log("Ram installed");
});
redisClient.on("reconnecting", () => {
  // isRedisConnected = true;
  console.log("Ram trying to reconnect");
});
redisClient.on("end", () => {
  isRedisConnected = false;
  console.log("Ram uninstalled");
});

redisClient.on("error", (err) => {
    console.error("Ram Error:", err);
  });


export default redisClient;
export { isRedisConnected };
