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
import { AlertCircle, Upload, CheckCircle2 } from 'lucide-react';

export default function ReportIssuePage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        description: '',
        reference: ''
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
            if (!formData.name || !formData.phone || !formData.description) {
                throw new Error('Veuillez remplir les champs obligatoires');
            }

            let imageUrl = '';

            // Upload image if present
            if (imageFile) {
                const fileRef = storageRef(storage, `issues/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(fileRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
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
            setFormData({ name: '', phone: '', description: '', reference: '' });
            setImageFile(null);

        } catch (err: any) {
            console.error('Error reporting issue:', err);
            setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-neutral-900 border-neutral-800 p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Rapport Envoyé</h1>
                    <p className="text-gray-400 mb-8">
                        Merci de nous avoir signalé ce problème. Notre équipe va examiner votre rapport et vous recontacter si nécessaire sur le numéro {formData.phone}.
                    </p>
                    <Button
                        onClick={() => setSuccess(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Envoyer un autre rapport
                    </Button>
                    <div className="mt-4">
                        <Button
                            variant="link"
                            className="text-gray-400 hover:text-white"
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
        <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Signaler un Problème
                </h1>
                <p className="text-gray-400 mb-8">
                    Vous avez rencontré un problème lors du vote ? Remplissez ce formulaire et joignez une capture d'écran si possible.
                </p>

                <Card className="bg-neutral-900 border-neutral-800 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-yellow-500">Nom complet *</Label>
                            <Input
                                id="name"
                                required
                                className="bg-neutral-800 border-neutral-700 focus:border-yellow-500 text-white placeholder:text-gray-500"
                                placeholder="Votre nom"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-yellow-500">Numéro de téléphone *</Label>
                            <Input
                                id="phone"
                                required
                                type="tel"
                                className="bg-neutral-800 border-neutral-700 focus:border-yellow-500 text-white placeholder:text-gray-500"
                                placeholder="6xxxxxxxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference" className="text-yellow-500">Référence de transaction (Si disponible)</Label>
                        <Input
                            id="reference"
                            className="bg-neutral-800 border-neutral-700 focus:border-yellow-500 text-white placeholder:text-gray-500"
                            placeholder="ex: MP251209.2039.C45116"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-yellow-500">Description du problème *</Label>
                        <Textarea
                            id="description"
                            required
                            className="bg-neutral-800 border-neutral-700 focus:border-yellow-500 min-h-[120px] text-white placeholder:text-gray-500"
                            placeholder="Expliquez ce qui s'est passé..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-yellow-500">Preuve (Capture d'écran)</Label>
                        <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 hover:border-blue-500/50 transition-colors text-center cursor-pointer relative bg-neutral-800/20">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Upload className="w-8 h-8 mb-2" />
                                {imageFile ? (
                                    <span className="text-blue-400 font-medium">{imageFile.name}</span>
                                ) : (
                                    <>
                                        <span className="font-medium">Cliquez pour ajouter une image</span>
                                        <span className="text-xs">PNG, JPG (Max 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-6"
                    >
                        {loading ? 'Envoi en cours...' : 'Envoyer le rapport'}
                    </Button>
                </form>
            </Card>
        </div>
        </div >
    );
}
