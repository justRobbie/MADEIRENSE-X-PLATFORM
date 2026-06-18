import {
    useState,
    type ChangeEvent
} from "react";

import OrdersList, {
    OrderList$Enumerators,
    OrderList$Types
} from "components/lists/order";

// ***************************************************************************************************************

function BackOfficeOrdersPage() {
    const [type, setType] = useState<OrderList$Types.status>("ongoing");

    function handleTypePick({ target }: ChangeEvent<HTMLSelectElement>) {
        setType((target as HTMLSelectElement).value as OrderList$Types.status);
    };

    return <main>
        <section>
            <header className="w-full flex flex-row justify-start items-center gap-2">
                <select className="mr-auto" title="Tipo de listas" id="type" data-element="h1" name="type" defaultValue={type} onChange={handleTypePick}>
                    {(Object.values(OrderList$Enumerators.Statuses)).map(s => <option key={s} value={s}>
                        {s === "all" && <>Pedidos</>}
                        {s === "delivering" && <>A ser entregue</>}
                        {s === "ongoing" && <>Fila</>}
                    </option>)}
                </select>
            </header>

            <OrdersList
                mode="admin"
                type="orders"
                filter="delivery"
                statusType={type}
                trackAppUpdates
            />
        </section>
    </main>
};

export default BackOfficeOrdersPage;