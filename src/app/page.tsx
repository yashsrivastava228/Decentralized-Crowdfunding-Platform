"use client";
import { useReadContract } from "thirdweb/react";
import { client } from "./client";
import { baseSepolia } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { CampaignCard } from "@/components/CampaignCard";
import { CROWDFUNDING_FACTORY } from "./constants/contracts";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";

export default function Home() {
  // Get CrowdfundingFactory contract
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: CROWDFUNDING_FACTORY,
  });

  // Get all campaigns deployed with CrowdfundingFactory
  const {
    data: campaigns,
    isLoading: isLoadingCampaigns,
    refetch: refetchCampaigns,
  } = useReadContract({
    contract: contract,
    method:
      "function getAllCampaigns() view returns ((address campaignAddress, address owner, string name)[])",
    params: [],
  });

  //reverse the campaign array
  const [reversedCampaigns, setReversedCampaigns] = useState([
    { campaignAddress: "", owner: "", name: "" },
  ]);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      // Reverse campaigns once when loaded
      setReversedCampaigns([...campaigns].reverse());
    }
  }, [campaigns]);

  return (
    <main className="mx-auto max-w-7xl px-4 mt-4 sm:px-6 lg:px-8">
      <div className="py-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-b from-pink-600 to-purple-700 bg-clip-text text-transparent mb-4">
          Campaigns:
        </h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isLoadingCampaigns && (
            <p className="text-3xl font-semibold text-blue-500 mb-4">
              Loading campaigns{" "}
              <AiOutlineLoading className="inline animate-spin" />
            </p>
          )}
          {!isLoadingCampaigns &&
            campaigns &&
            reversedCampaigns &&
            (campaigns.length > 0 && reversedCampaigns.length > 0 ? (
              reversedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.campaignAddress}
                  campaignAddress={campaign.campaignAddress}
                />
              ))
            ) : (
              <p>No Campaigns</p>
            ))}
        </div>
      </div>
    </main>
  );
}
