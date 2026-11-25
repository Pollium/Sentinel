import { Button, DropdownItem, DropdownItemIndicator, DropdownMenu, DropdownPopover, DropdownRoot, DropdownSection } from '@heroui/react';

interface PeriodMenuProps<T extends string>{
    value: T;
    periods: T[];
    labelOf: (period: T) => string;
    onChange: (period: T) => void;
}

const PeriodMenu = <T extends string>({ value, periods, labelOf, onChange }: PeriodMenuProps<T>) => (
    <DropdownRoot>
        <Button size='sm' variant='ghost' aria-label={`Period: ${labelOf(value)}`} className='shrink-0 gap-1'>
            {labelOf(value)}
            <span aria-hidden='true' className='text-[0.625rem]'>▾</span>
        </Button>

        <DropdownPopover placement='bottom end'>
            <DropdownMenu aria-label='Period'>
                <DropdownSection
                    selectionMode='single'
                    disallowEmptySelection
                    selectedKeys={[value]}
                    onSelectionChange={(keys) => {
                        const picked = periods.find((period) => keys !== 'all' && keys.has(period));
                        if(picked !== undefined) onChange(picked);
                    }}
                >
                    {periods.map((period) => (
                        <DropdownItem key={period} id={period} textValue={labelOf(period)}>
                            {labelOf(period)}
                            <DropdownItemIndicator />
                        </DropdownItem>
                    ))}
                </DropdownSection>
            </DropdownMenu>
        </DropdownPopover>
    </DropdownRoot>
);

export default PeriodMenu;
