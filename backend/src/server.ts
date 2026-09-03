import "./load-env";
import { app } from "@/app";
import { env } from "@/config/env";

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`server listening on ${env.PORT}`);
});
