import { DefaultRoute } from "./default";
import { PostRoute } from "./post-route";
import { UserRoute } from "./user-route";

const routes = [new UserRoute(), new DefaultRoute(), new PostRoute()];

export default routes;
