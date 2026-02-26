import {MobileLayout} from "../components/mobile/MobileLayout.jsx";
import {Card, CardContent} from "../components/mobile/ui/card.jsx";
import React from "react";

export default function Search() {

    return <MobileLayout>
        <div className="p-5 space-y-8">
            <Card className="border-none shadow-sm">
                <CardContent className="py-10 text-center">
                    <p className="text-slate-500">현재 개발중인 기능이에요.</p>
                </CardContent>
            </Card>
        </div>
    </MobileLayout>
}
