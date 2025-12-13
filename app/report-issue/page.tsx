'use client';

import { useState } from 'react';
import { database, storage } from '@/lib/firebase';
import { ref as dbRef, push, serverTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Upload, CheckCircle2, Clock } from 'lucide-react';
import Image from 'next/image';

export default function ReportIssuePage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        description: '',
        reference: '',
        time: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.name || !formData.phone || !formData.description || !formData.time) {
                throw new Error('Veuillez remplir les champs obligatoires');
            }

            let imageUrl = '';

            // Upload image if present
            if (imageFile) {
                try {
                    const fileRef = storageRef(storage, `issues/${Date.now()}_${imageFile.name}`);
                    const snapshot = await uploadBytes(fileRef, imageFile);
                    imageUrl = await getDownloadURL(snapshot.ref);
                } catch (uploadError: any) {
                    console.error('Image upload failed:', uploadError);
                    // Decide whether to block or continue. 
                    // Given the billing issue, we should probably inform the user but allow text submission?
                    // Or automatically retry? No, retry won't help billing.
                    // Let's modify the description to note the failure.
                    formData.description += `\n\n[Note système: L'upload de l'image a échoué (Erreur: ${uploadError.code || uploadError.message})]`;

                    // Optional: You could set a specific UI warning state here if you wanted.
                }
            }

            // Save issue to database
            const issuesRef = dbRef(database, 'issues');
            await push(issuesRef, {
                ...formData,
                imageUrl,
                status: 'pending',
                createdAt: serverTimestamp(),
                reviewStatus: 'unreviewed'
            });

            setSuccess(true);
            setFormData({ name: '', phone: '', description: '', reference: '', time: '' });
            setImageFile(null);

        } catch (err: any) {
            console.error('Error reporting issue:', err);
            // Only block if the main database save failed
            setError(err.message || 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen relative text-white flex items-center justify-center p-4 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/banner-dancers.jpg"
                        alt="Background"
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-purple-900/40" />
                </div>

                <Card className="max-w-md w-full bg-black/40 backdrop-blur-xl border-zinc-800 p-8 text-center relative z-10 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/50">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                        Rapport Envoyé
                    </h1>
                    <p className="text-zinc-300 mb-8 leading-relaxed">
                        Merci de nous avoir signalé ce problème. Notre équipe va examiner votre rapport et vous recontacter si nécessaire sur le numéro <span className="font-semibold text-white">{formData.phone}</span>.
                    </p>
                    <Button
                        onClick={() => setSuccess(false)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 rounded-xl transition-all hover:scale-[1.02]"
                    >
                        Signaler un autre problème
                    </Button>
                    <div className="mt-6">
                        <Button
                            variant="link"
                            className="text-zinc-400 hover:text-white"
                            onClick={() => window.location.href = '/'}
                        >
                            Retour à l'accueil
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative text-white p-4 md:p-8 overflow-x-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 fixed">
                <Image
                    src="/banner-dancers.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-purple-900/40" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10 mt-8 md:mt-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
                        Signaler un Problème
                    </h1>
                    <p className="text-zinc-300 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                        Vous avez rencontré une difficulté lors du vote (paiement non validé, page bloquée...) ? Remplissez ce formulaire pour que nous puissions vous aider rapidement.
                    </p>
                </div>

                <Card className="bg-black/40 backdrop-blur-xl border-zinc-800/50 p-6 md:p-8 shadow-2xl rounded-2xl ring-1 ring-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-300 font-medium ml-1">Nom complet *</Label>
                                <Input
                                    id="name"
                                    required
                                    className="bg-zinc-900/50 border-zinc-700/50 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-zinc-600 h-12 rounded-xl"
                                    placeholder="Votre nom"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-zinc-300 font-medium ml-1">Numéro de téléphone *</Label>
                                <Input
                                    id="phone"
                                    required
                                    type="tel"
                                    className="bg-zinc-900/50 border-zinc-700/50 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-zinc-600 h-12 rounded-xl"
                                    placeholder="6xxxxxxxx"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="time" className="text-zinc-300 font-medium ml-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    Heure du vote *
                                </Label>
                                <Input
                                    id="time"
                                    required
                                    type="time"
                                    className="bg-zinc-900/50 border-zinc-700/50 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-zinc-600 h-12 rounded-xl"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reference" className="text-zinc-300 font-medium ml-1">Référence transaction (Optionnel)</Label>
                                <Input
                                    id="reference"
                                    className="bg-zinc-900/50 border-zinc-700/50 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-zinc-600 h-12 rounded-xl"
                                    placeholder="ex: MP251209..."
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-zinc-300 font-medium ml-1">Description du problème *</Label>
                            <Textarea
                                id="description"
                                required
                                className="bg-zinc-900/50 border-zinc-700/50 focus:border-purple-500 focus:ring-purple-500/20 min-h-[120px] text-white placeholder:text-zinc-600 rounded-xl resize-none"
                                placeholder="Expliquez ce qui s'est passé..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300 font-medium ml-1">Preuve (Capture d'écran)</Label>
                            <div className="border-2 border-dashed border-zinc-700/50 hover:border-purple-500/50 bg-zinc-900/30 rounded-xl p-8 transition-colors text-center cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-3 text-zinc-400 group-hover:text-purple-400 transition-colors">
                                    <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-purple-500/20 transition-colors">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    {imageFile ? (
                                        <span className="text-purple-400 font-semibold">{imageFile.name}</span>
                                    ) : (
                                        <>
                                            <span className="font-semibold text-lg">Cliquez pour ajouter une image</span>
                                            <span className="text-xs text-zinc-500">PNG, JPG (Max 5MB)</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.01]"
                        >
                            {loading ? 'Envoi en cours...' : 'Envoyer le rapport'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div >
    );
}
