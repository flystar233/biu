import React from "react";
import { useNavigate } from "react-router";

import { Avatar, Card, CardBody } from "@heroui/react";
import { RiFlashlightFill } from "@remixicon/react";

import type { RelationListItem } from "@/service/relation-followings";
import type { RelationTagUser } from "@/service/relation-tag";

interface Props {
  u: RelationListItem | RelationTagUser;
}

const UserCard = ({ u }: Props) => {
  const navigate = useNavigate();

  return (
    <Card
      key={u.mid}
      radius="md"
      as="div"
      isPressable
      onPress={() => navigate(`/user/${u.mid}`)}
      className="group relative aspect-square w-full overflow-hidden"
    >
      <CardBody className="flex items-center justify-center space-y-2 overflow-hidden p-3">
        <div className="relative h-16 w-16 flex-none">
          <Avatar className="text-large h-16 w-16" src={`${u.face}@128w_128h_1c_1s.webp`} name={u.uname} />
          {u.official_verify?.type !== undefined && u.official_verify?.type >= 0 && (
            <div
              className={`ring-background absolute right-0.5 bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ${u.official_verify.type === 0 ? "bg-warning" : "bg-primary"}`}
            >
              <RiFlashlightFill size={12} />
            </div>
          )}
        </div>
        <div className="flex w-full flex-col items-center space-y-0.5">
          <span className="max-w-full min-w-0 truncate text-sm font-medium">{u.uname}</span>
          <span className="text-foreground-500 line-clamp-1 w-full text-center text-xs">{u.sign}</span>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserCard;
