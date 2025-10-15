import React from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { User } from "lucide-react";

export default function Profile() {
    const { currentUserInfo } = useAppSelector((state) => state.info);

    return (
        <main className="w-full">
            {/* Yuqori banner (to‘liq kenglik) */}
            <div className="w-full px-6 pt-6">
                <div className="w-full rounded-2xl px-6 py-5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Profile</h1>
                        <p className="text-xs text-white/80">Foydalanuvchi ma’lumotlari</p>
                    </div>
                </div>
            </div>

            {/* Form qismi (ham to‘liq kenglik) */}
            <section className="w-full px-6 pb-10">
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-sm text-slate-600">Ism</span>
                        <input
                            type="text"
                            disabled
                            readOnly
                            value={currentUserInfo?.name ?? ""}
                            placeholder="—"
                            className="mt-1 w-full h-11 rounded-xl border border-slate-300 bg-slate-100 px-3 text-slate-900
                         disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-slate-600">Foydalanuvchi turi</span>
                        <input
                            type="text"
                            disabled
                            readOnly
                            value={currentUserInfo?.type_user ?? ""}
                            placeholder="—"
                            className="mt-1 w-full h-11 rounded-xl border border-slate-300 bg-slate-100 px-3 text-slate-900
                         disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-slate-600">Viloyat</span>
                        <input
                            type="text"
                            disabled
                            readOnly
                            value={currentUserInfo?.region.name ?? ""}
                            placeholder="—"
                            className="mt-1 w-full h-11 rounded-xl border border-slate-300 bg-slate-100 px-3 text-slate-900
                         disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none"
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm text-slate-600">Tuman</span>
                        <input
                            type="text"
                            disabled
                            readOnly
                            value={currentUserInfo?.district.name ?? ""}
                            placeholder="—"
                            className="mt-1 w-full h-11 rounded-xl border border-slate-300 bg-slate-100 px-3 text-slate-900
                         disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-slate-600">Biriktirilgan ombor</span>
                        <input
                            type="text"
                            disabled
                            readOnly
                            value={currentUserInfo?.warehouse.name ?? ""}
                            placeholder="—"
                            className="mt-1 w-full h-11 rounded-xl border border-slate-300 bg-slate-100 px-3 text-slate-900
                         disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-slate-600">Xodim</span>
                        <input
                            type="text"
                            disabled
                            readOnly
                            value={currentUserInfo?.employee.name ?? ""}
                            placeholder="—"
                            className="mt-1 w-full h-11 rounded-xl border border-slate-300 bg-slate-100 px-3 text-slate-900
                         disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-slate-600">Telefon raqam</span>
                        <input
                            type="text"
                            disabled
                            readOnly
                            value={currentUserInfo?.employee.phone_number ?? ""}
                            placeholder="—"
                            className="mt-1 w-full h-11 rounded-xl border border-slate-300 bg-slate-100 px-3 text-slate-900
                         disabled:opacity-100 disabled:cursor-not-allowed focus:outline-none"
                        />
                    </label>

                </div>
            </section>
        </main>
    );
}
