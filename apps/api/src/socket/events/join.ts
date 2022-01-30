import { Event } from "../types";
import { MediasoupRoom } from "../../mediasoup/room";

const handler: Event<"join"> = {
  on: "join",
  invoke: async ({ io, peer, payload, socket, cb }) => {
    const room = MediasoupRoom.findById(payload.room_id);
    if (room.hasPeer(peer.user._id)) {
      room.peers.delete(peer.user._id);
    }

    peer.rtpCapabilities = payload.rtp_capabilities;
    room.join(peer);

    socket.join(payload.room_id);

    const peers = room._peers();

    for (const p of peers) {
      if (p.user._id === peer.user._id) {
        continue;
      }

      for (const producer of p.producers.values()) {
        await room.createConsumer({
          io,
          consumer_peer: peer,
          producer_peer: p,
          producer
        });
      }
    }

    socket.to(payload.room_id).emit("new peer", { peer: peer.user });

    cb({ peers: room.users().filter((p) => p._id !== peer.user._id) });
  }
};

export default handler;