import { MediasoupRoom } from "../../mediasoup/room";
import { Event } from "../types";

const handler: Event<"produce"> = {
  on: "produce",
  invoke: async ({
    io,
    peer,
    payload: { room_id, transport_id, kind, rtp_parameters, app_data },
    cb
  }) => {
    if (!peer.active_room_id) {
      throw new Error("peer not yet joined");
    }

    const room = MediasoupRoom.findById(room_id);
    if (!room.hasPeer(peer.user._id) || peer.active_room_id !== room.id) {
      throw new Error("peer not yet joined");
    }

    const transport = peer.transports.get(transport_id);
    if (!transport) {
      throw new Error(`no transport with id ${transport_id} found`);
    }

    const producer = await transport.produce({
      kind,
      rtpParameters: rtp_parameters,
      appData: {
        ...app_data,
        peer_id: peer.user._id
      }
    });

    peer.producers.set(producer.id, producer);

    const peers = room._peers().filter((p) => p.user._id !== peer.user._id);

    for (const p of peers) {
      await room.createConsumer({
        consumer_peer: p,
        producer_peer: peer,
        producer: producer
      });
    }

    cb({ id: producer.id });
  }
};

export default handler;
