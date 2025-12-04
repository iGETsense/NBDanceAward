"use client"

import { Suspense } from "react"
import NBDanceAwardPage from "./PageContent"

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white">Site en maintenance ....\n mercie de bien vouloir patienter</div>
        </div>}>
            //<NBDanceAwardPage />
        </Suspense>
    )
}
