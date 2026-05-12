import { useCallback, useState } from "react";

import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { RiAddLine, RiFontSize, RiSubtractLine } from "@remixicon/react";

import IconButton from "../icon-button";

interface FontSizeControlProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  onOpenChange?: (open: boolean) => void;
}

const FontSizeControl = ({ value, min = 12, max = 48, onChange, onOpenChange }: FontSizeControlProps) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const step = 2;

  return (
    <Popover
      placement="right"
      showArrow={false}
      shouldCloseOnBlur={false}
      disableAnimation
      offset={8}
      isOpen={open}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger>
        <IconButton
          size="sm"
          variant="light"
          aria-label="调整字体大小"
          className="bg-foreground/20 text-foreground hover:bg-foreground/30 min-w-0 rounded-full text-sm font-semibold"
        >
          <RiFontSize size={16} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="px-1 py-1">
        <div className="bg-foreground/10 flex items-center gap-1 rounded-lg p-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="sm"
            isDisabled={value <= min}
            onPress={() => onChange(Math.max(min, value - step))}
            className="text-foreground/70 hover:text-foreground h-7 w-7 min-w-0"
          >
            <RiSubtractLine size={14} />
          </Button>
          <span className="text-foreground/80 min-w-[36px] text-center text-xs font-medium tabular-nums select-none">
            {Math.round(value)}px
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="sm"
            isDisabled={value >= max}
            onPress={() => onChange(Math.min(max, value + step))}
            className="text-foreground/70 hover:text-foreground h-7 w-7 min-w-0"
          >
            <RiAddLine size={14} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FontSizeControl;
