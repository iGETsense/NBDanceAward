import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, CreditCard, ShieldAlert, ChevronRight } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export interface AdminTutorialProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdminTutorial({ open, onOpenChange }: AdminTutorialProps) {
    // Internal state step is fine to keep here
    const [step, setStep] = useState(0);

    const handleClose = () => {
        onOpenChange(false);
        localStorage.setItem('nb_admin_tutorial_seen', 'true');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            {/* Added w-[95vw] to ensure it fits on small mobile screens without cutoff */}
            <DialogContent className="w-[95vw] max-w-md sm:max-w-xl md:max-w-2xl bg-[#0a0a0a] border border-zinc-800 text-white max-h-[85vh] flex flex-col p-0 shadow-2xl shadow-black/50 gap-0 focus:outline-none">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none h-32" />

                <DialogHeader className="p-6 pb-4 relative z-10 flex-shrink-0 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-white/5">
                    <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                        <div className="bg-yellow-500/20 p-2 rounded-lg">
                            <Info className="text-yellow-500 h-6 w-6" />
                        </div>
                        <span>Bienvenue Admin</span>
                    </DialogTitle>
                    <p className="text-zinc-400 mt-2 text-sm sm:text-base">
                        Guide rapide pour gérer le système sans erreur.
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    <motion.div
                        className="space-y-6 pb-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Section 1: Dashboard */}
                        <motion.section variants={itemVariants} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                <CreditCard className="h-5 w-5 text-yellow-500" />
                                1. L'Argent
                            </h3>
                            <div className="space-y-2 text-sm text-zinc-400 pl-2 border-l-2 border-zinc-800 ml-2">
                                <p><span className="text-white font-medium">Solde Réel :</span> C'est l'argent disponible chez MeSomb. C'est le seul montant que vous pouvez retirer.</p>
                                <p><span className="text-white font-medium">Total Brut :</span> Chiffre d'affaires théorique (peut inclure des frais non déduits).</p>
                            </div>
                        </motion.section>

                        {/* Section 2: Transactions */}
                        <motion.section variants={itemVariants} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                2. Les Transactions
                            </h3>
                            <ul className="space-y-2 text-sm text-zinc-400 bg-black/20 p-3 rounded-lg">
                                <li className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span><span className="text-green-400">Complété</span> : Tout est bon.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                    <span><span className="text-yellow-500">En attente</span> : Paiement initié mais pas validé.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <span><span className="text-red-500">Échoué</span> : Refusé par l'opérateur.</span>
                                </li>
                            </ul>
                            <div className="mt-3 flex items-start gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p>Astuce : Si le statut reste bloqué "En attente", utilisez le bouton <strong>Vérifier</strong> pour forcer la mise à jour.</p>
                            </div>
                        </motion.section>

                        {/* Section 3: Issues */}
                        <motion.section variants={itemVariants} className="bg-zinc-900/50 p-4 rounded-xl border border-red-500/20">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                3. Problème Orange ?
                            </h3>
                            <div className="text-sm space-y-2">
                                <p className="text-zinc-300">
                                    Si vous voyez <span className="text-red-400 font-mono text-xs bg-red-950 p-1 rounded">Cannot initialize the transaction</span> :
                                </p>
                                <div className="bg-red-500/10 border-l-2 border-red-500 p-2 pl-3 rounded-r text-xs text-red-200">
                                    Ce n'est <strong>PAS</strong> un bug du site. <br />
                                    C'est le réseau Orange qui sature ou MeSomb qui a atteint une limite. Attendez un peu.
                                </div>
                            </div>
                        </motion.section>

                        {/* Section 4: Security */}
                        <motion.section variants={itemVariants} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                <ShieldAlert className="h-5 w-5 text-blue-500" />
                                4. Sécurité
                            </h3>
                            <p className="text-sm text-zinc-400">
                                Déconnectez-vous après usage. Le compte se verrouille après 5 échecs.
                            </p>
                        </motion.section>
                    </motion.div>
                </div>

                <DialogFooter className="p-6 bg-zinc-900 border-t border-zinc-800 z-10 flex-col sm:flex-row gap-3 flex-shrink-0">
                    <p className="text-xs text-zinc-500 text-center sm:text-left flex-1 py-2">
                        Ne s'affiche qu'une seule fois.
                    </p>
                    <Button
                        onClick={handleClose}
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:scale-105 transition-transform"
                    >
                        C'est compris, let's go ! 🚀
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
