'use client';

import { useParams, useRouter } from 'next/navigation';
import { PhaseDetail } from '@/components/PhaseDetail';

export default function PhasePage() {
    const params = useParams();
    const router = useRouter();

    return (
        <PhaseDetail
            projectId={params.projectId as string}
            phaseId={params.phaseId as string}
            onBack={() => router.push('/')}
        />
    );
}
