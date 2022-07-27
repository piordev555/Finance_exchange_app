import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: any;
    Echo: Echo;
  }
}

class SocketNotification {
  laravelEcho: any = null;

  constructor(
    wsHost: string,
    wsPort: string,
    wssPort: string,
    forceTLS: string,
    broadcastingAuth: any
  ) {
    window.Pusher = Pusher;
    this.laravelEcho = new Echo({
      broadcaster: "pusher",
      key: "1ec7db3d-24ad-62a0-b0d1-0242ac110002",
      wsHost,
      wsPort,
      wssPort,
      forceTLS,
      encrypted: true,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      cluster: "mt1",
      authorizer: (channel: any, options: any) => {
        return {
          authorize: (socketId: any, callback: any) => {
            broadcastingAuth(socketId, channel)
              .then((response: any) => {
                callback(false, response);
              })
              .catch((error: any) => {
                callback(true, error);
              });
          },
        };
      },
    });
  }

  companySubscriptionHandler(company_id: string) {
    return this.laravelEcho.private(`Users.Models.Company.${company_id}`);
  }
  userSubscriptionHandler(user_id: string) {
    return this.laravelEcho.private(`User.${user_id}`);
  }
}

const SN = new SocketNotification("", "", "", "", "");

export default SN;
