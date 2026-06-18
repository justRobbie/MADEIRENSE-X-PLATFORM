import {
    useState,
    type ComponentProps,
    type MouseEvent
} from "react";

import Button from "components/buttons";
import Icon from "components/icon";

import DiscountForm from "./discount";
import CouponForm from "./coupon";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"section"> {
    callback?: () => void;
};

type scrollSectionType = (
    | "coupons"
    | "discounts"
    | "new"
);

const ScrollToSection = ({ 
    callback, 
    ...props
}: { 
    callback?: () => void
} & ComponentProps<"section">) => {
    const [pickedSection, setPickedSection] = useState<`section-${scrollSectionType}`>("section-discounts");

    const sections = [
        { key: `Descontos`, value: "section-discounts", icon: <Icon name="Discount" /> },
        { key: `Atribuir`, value: "section-new", icon: <Icon name="Add" /> },
        { key: `Cupons`, value: "section-coupons", icon: <Icon name="Coupon" /> },
    ];

    function pickSection(e: MouseEvent<HTMLButtonElement>) {
        const { value } = (e.target as HTMLButtonElement);

        const $section = document.getElementById(value);

        if (!$section) return;

        $section.scrollIntoView({ behavior: "smooth" });

        setPickedSection(value as any);
    }

    return <section className="HORIZONTAL_SCROLLTO_SECTION" {...props}>
        <header>
            {sections.map(kvp => <Button key={kvp.key} onClick={pickSection} value={kvp.value} variant="text" data-selected={pickedSection === kvp.value}>
                {kvp.icon}

                {kvp.key}
            </Button>)}
        </header>

        <div data-type="container" className="overflow-auto">
            <section id="section-discounts" data-state={pickedSection === "section-discounts" ? "idle" : "disabled"}>
                <DiscountForm mode="edit" {...{ callback }} />
            </section>

            <section id="section-new" data-state={pickedSection === "section-new" ? "idle" : "disabled"}>
                <DiscountForm mode="add" {...{ callback }} />
            </section>

            <section id="section-coupons" data-state={pickedSection === "section-coupons" ? "idle" : "disabled"}>
                <CouponForm {...{ callback }} />
            </section>
        </div>
    </section>
};

const ProductDiscountForm = ({ callback, ...props }: IPropTypes) => {
    return <ScrollToSection {...{ callback }} {...props} />;
};

export default ProductDiscountForm;