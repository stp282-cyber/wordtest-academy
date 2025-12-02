import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const WordMatch = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6 p-8">
            <Card className="text-center p-12 border-4 border-black shadow-neo-lg">
                <h2 className="text-4xl font-black mb-4">Word Match Game</h2>
                <p className="text-xl mb-8">This game is currently being updated.</p>
                <div className="mt-8">
                    <Button onClick={() => window.history.back()}>Go Back</Button>
                </div>
            </Card>
        </div>
    );
};

export default WordMatch;
