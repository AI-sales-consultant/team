"use client"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Terms & Conditions</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-300 hover:text-slate-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm leading-relaxed">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">TERMS AND CONDITIONS</h1>
                <p className="text-slate-600">
                  These are the Ascent terms and conditions, which apply to your use of the services (including the
                  Ascent platform) and constitute a legally binding agreement between you and us. If you use our
                  services, you confirm that you are 18+ years old and have read, understand, and accepted them.
                </p>
                <p className="font-semibold text-red-600 mt-4">
                  IF YOU DO NOT AGREE TO THESE TERMS YOU MUST DISCONTINUE USE OF THE SERVICES/WEBSITE
                </p>
                <p className="text-slate-300 mt-2">Updated: 10 May 2024</p>
              </div>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(1) SUMMARY</h2>
                <div className="space-y-3">
                  <p>
                    <strong>1.1.</strong> We are BRIGHT EVOLVE LTD, a limited company incorporated in England & Wales
                    with company number 14701094, whose registered office is at 23 Westfield Park, Bristol, England, BS6
                    6LT ('we, 'our' and 'us).
                  </p>
                  <p>
                    <strong>1.2.</strong> You are the person using our website, services, or the Ascent platform
                    ('platform'), including any of the outputs of the services ('deliverables') (collectively, the
                    'services') ('you', 'your' and 'yours').
                  </p>
                  <p>
                    <strong>1.3. Agreement.</strong> These terms and conditions ('these terms' or 'terms of service')
                    form an agreement ('agreement') between you and us (the parties) for the provision of the services
                    to you. By using the services, you accept these terms.
                  </p>
                  <p>
                    <strong>1.4. Platform.</strong> We provide the following services on a non-exclusive basis: (a)
                    access to the platform on different subscription tiers ('plan'): (i) Tier 1 (Self-serve): £695 (plus
                    VAT) for 12 months' access (minimum term) to the Ascent platform. (ii) Tier 2: (Supported): £2,995
                    (plus VAT) for 12 months' access (minimum term) to the Ascent platform, and tailored support from an
                    expert consultant. (b) consultancy services and charges agreed from time to time.
                  </p>
                  <p>
                    <strong>1.6. Subscriptions.</strong> Each subscription is valid for one legal entity in one country
                    and one authorised user per entity, unless otherwise agreed. If your organisation comprises or spans
                    multiple legal entities or countries, each entity in each country needs to purchase a separate
                    subscription to have access to the platform. The subscription grants access to the individual or
                    individuals expressly authorised by you ('authorised users'). You agree to ensure that each
                    authorised user complies with these terms and conditions, and they will also need to accept these
                    terms.
                  </p>
                  <p>
                    <strong>1.7. Ordering services.</strong> You can place an offer to purchase services via us or our
                    website by following the onscreen prompts and instructions provided. Each order is an offer by you
                    to purchase services subject to these terms. Our acceptance of your order takes place when we
                    provide access to the platform or send you an acceptance email.
                  </p>
                  <p>
                    <strong>1.8. Agreeing consultancy services.</strong> The parties can agree services in principle
                    from time to time in statements of work or, where agreed, via email. If we agree to provide those
                    services, both parties shall execute the statements of work or, where applicable, mutually agree
                    them via email. Statements of work form part of, and are incorporated into, the agreement.
                  </p>
                  <p>
                    <strong>1.9. Updates to these terms.</strong> We may amend these terms from time to time and updates
                    are effective immediately upon written notice to you by email. If any update materially adversely
                    affects your rights and obligations, those changes will be effective no sooner than 30 days after we
                    notify you. Your continued use of the services means you agree to such changes.
                  </p>
                  <p>
                    <strong>1.10. Security.</strong> You agree to use all reasonable endeavours to prevent unauthorised
                    access to or use of the platform, including safeguarding login credentials, and you accept
                    responsibility for all activities on your account.
                  </p>
                  <p>
                    <strong>1.11.</strong> 'Agreed' means agreed in writing by the parties, and 'writing'/'written'
                    includes email, in these terms.
                  </p>
                  <p>
                    <strong>1.12. Priority.</strong> Provisions in this clause 1 shall have priority over provisions in
                    the rest of these terms to the extent of any conflict or ambiguity.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(2) PAYMENT</h2>
                <div className="space-y-3">
                  <p>
                    <strong>2.1. Charges.</strong> (a) You agree to pay us the applicable charges for the services,
                    including the subscription fees or any charges for agreed consultancy services, as quoted to you in
                    writing ('charges'). (b) Charges are due and payable as follows, unless otherwise agreed in writing:
                    (i) subscription fees are due and payable in advance before we provide access to the platform; and
                    (ii) charges for consultancy services are due in advance and payable within 30 days of the date of
                    invoice. (c) We'll invoice you accordingly. (d) Charges are non-refundable.
                  </p>
                  <p>
                    <strong>2.2. How to pay.</strong> Electronic bank transfer or credit card payments via Stripe or
                    other similar payment processor permitted by us, in which case you authorise us/our third party
                    payment processors to charge your payment method (an up-to-date, valid, accepted, authorised method
                    of payment) for the charges on or after the due dates.
                  </p>
                  <p>
                    <strong>2.3. Billing.</strong> If required by us at any time, you agree to promptly provide
                    up-to-date, accurate and complete billing information and one or more payment methods.
                  </p>
                  <p>
                    <strong>2.4. Taxes.</strong> Charges quoted exclude VAT, which you agree to pay to us at the
                    prevailing rate (if applicable).
                  </p>
                  <p>
                    <strong>2.5.</strong> Interest is charged to you on overdue sums from the due date until payment,
                    whether before or after judgment, which will accrue each day at 4% a year above the Bank of
                    England's base rate from time to time, but at 4% a year for any period when that base rate is below
                    0%.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(3) TERM AND TERMINATION</h2>
                <div className="space-y-3">
                  <p>
                    <strong>3.1. Commencement.</strong> These terms first come into effect on the earlier of the
                    following dates, as applicable (the 'effective date'): (a) the date you first use the services; (b)
                    the date your first order is accepted by us; or (c) another effective date agreed in writing (if
                    applicable).
                  </p>
                  <p>
                    <strong>3.2. Duration.</strong> (a) The agreement continues until you let us know in writing that
                    you'd like to terminate it, or vice versa. However, the earliest it can end is once your
                    subscription plans have ended, after any agreed minimum term, and once all agreed consultancy
                    services have been provided, unless terminated earlier in accordance with these terms. (b) Either
                    party may end the consultancy services with 30 days' written notice at any time for any reason (for
                    convenience). Ending the consultancy services does not terminate the agreement. (c) Nothing in these
                    terms shall restrict our termination or suspension rights under clause 3.4.
                  </p>
                  <p>
                    <strong>3.3.</strong> Termination or expiry of the agreement does not affect any of the rights,
                    remedies, obligations or liabilities of the parties that have accrued up to the date of termination
                    or expiry.
                  </p>
                  <p>
                    <strong>3.4.</strong> (a) We have the right to end the agreement or licence(s) we may grant you,
                    disable your account, or suspend access to the platform, immediately by giving written notice to you
                    (and doing so doesn't affect our legal rights or remedies), if: (i) you materially (seriously)
                    breach the agreement; (ii) you don't pay us an amount we're owed for 7 days or more after the
                    payment due date; (iii) you repeatedly breach these terms; (iv) you stop or threaten to stop all or
                    a substantial part of your business, or become insolvent; (v) you die, become incapable of managing
                    your own affairs, or go bankrupt; (vi) any promise, statement or assurance given by you in the
                    agreement or our course of dealings is found to be untrue or fraudulent; (vii) you commit a crime;
                    (viii) you undergo a change of control.
                  </p>
                  <p>
                    <strong>3.5.</strong> When the agreement ends, for any reason, you agree to do the following
                    straight away: (a) pay our outstanding unpaid charges, and any interest and pre-agreed expenses; (b)
                    stop accessing the platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(4) INTELLECTUAL PROPERTY</h2>
                <div className="space-y-3">
                  <p>
                    <strong>4.1. Ownership of IP.</strong> We and our licensors shall retain ownership of all
                    intellectual property rights in the platform or any deliverables that form part of the services,
                    including patents, copyright, trademarks and service marks, business names, rights in designs,
                    confidential information (including know-how and trade secrets) and all other intellectual property
                    rights, in each case whether registered or unregistered globally.
                  </p>
                  <p>
                    <strong>4.2. Licence.</strong> (a) Subject to clauses 4.3, 4.4 and 4.5 and subject to your payment
                    of the charges in full for the services and ongoing adherence with these terms, we grant you the
                    following licence ('licences') unless otherwise agreed in writing: a non-exclusive,
                    non-transferable, non-sublicensable licence for your personal or internal business purposes: (i) to
                    access the platform for the term of your plan; (ii) to use deliverables provided to you for the term
                    of the agreement, unless otherwise agreed in writing.
                  </p>
                  <p>
                    <strong>4.3. Restrictions.</strong> You may not download, archive, reproduce, distribute, modify,
                    display, perform, publish, licence, create derivative works from or offer for sale or resale, or
                    otherwise commercialise or transfer, the platform or any part of it, without our prior written
                    consent.
                  </p>
                  <p>
                    <strong>4.4. Pre-existing work:</strong> the following elements incorporated into any deliverables
                    provided to you remain our property: the works, concepts, strategies, ideas, items and materials or
                    anything else either developed or procured to be developed by us or our team at any time for use in
                    relation to our business or any or all of our customers or clients generally, and not specifically
                    for the provision of the services to you. We hereby grant you (and if those elements shall include
                    any third-party materials, shall provide commercially reasonable assistance to procure the grant
                    from these third parties) the following licence to use those elements as part of the deliverables,
                    if you pay our charges in full: non-exclusive, non-transferable, non-sublicensable licence, for
                    personal or internal business purposes, for the term of the agreement.
                  </p>
                  <p>
                    <strong>4.5.</strong> We will be free to use all concepts, techniques, research and know-how
                    employed or developed by us in the provision of the services (excluding materials provided by you),
                    and we will be free to perform similar services for our other customers or clients using general
                    knowledge, skills and experience, and all pre-existing methodologies and techniques developed by us
                    at any time. You acknowledge that we may use products, materials, or methodologies proprietary to us
                    or a third party in our creation and delivery of the deliverables and, during the course of doing
                    so, may create proprietary materials or methodologies that are not part of the deliverables. You
                    agree that you will not have or obtain any rights in such proprietary products, materials and
                    methodologies.
                  </p>
                  <p>
                    <strong>4.6. The licence you grant us.</strong> (a) You grant us a fully paid-up, worldwide,
                    non-exclusive, royalty-free, non-transferable licence to use, copy and modify the materials you
                    provide to us for the term of the agreement for the purpose of providing the services to you. (b)
                    You grant us permission to use your testimonials and name, image and business name/logo anywhere to
                    announce/promote that you are our client, to promote our Business and services.
                  </p>
                  <p>
                    <strong>4.7. Intellectual property warranty.</strong> You confirm that our and our team's use of
                    your materials shall not infringe the rights, including any intellectual property rights, of any
                    third party.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(5) LIMITATION OF LIABILITY AND DISCLAIMERS</h2>
                <div className="space-y-3">
                  <p>
                    <strong>5.1. Limitation of liability.</strong> (a) References to liability in this clause 5 include
                    every kind of liability arising under or in connection with the agreement, for example liability in
                    contract, tort (including negligence), misrepresentation, restitution, breach of statutory duty, or
                    otherwise. (b) We do not exclude or limit our liability to you where it would be unlawful to do so,
                    e.g. these exceptions: liability for death or personal injury caused by negligence; fraud or
                    fraudulent misrepresentation.
                  </p>
                  <p>
                    <strong>5.2. Cap on liability.</strong> Except in the case of those exceptions, our total aggregate
                    liability to you arising under or in connection with the agreement will be limited to 100% of the
                    charges paid and payable under the agreement for the services that gave rise to the claim during the
                    12 months immediately preceding the date on which the claim arose.
                  </p>
                  <p>
                    <strong>5.3. Exclusions.</strong> To the fullest extent permitted by law, and excluding those
                    exceptions, the following types of loss arising out of or in connection with the agreement are
                    wholly excluded by us: (i) loss of profits; (ii) loss of sales or business; (iii) loss of agreements
                    or contracts; (iv) loss of use or corruption of software, data or information; (v) loss of or damage
                    to reputation or goodwill; (vi) indirect or consequential loss; and (vii) for the avoidance of
                    doubt, including loss arising as a result of our complying with our legal and regulatory duties.
                  </p>
                  <p>
                    <strong>5.4. Indemnity.</strong> You shall indemnify us and our affiliates and licensors against all
                    liabilities, costs, expenses, damages and losses (including but not limited to any direct, indirect
                    or consequential losses, loss of profit, loss of reputation and all interest, penalties and legal
                    costs (calculated on a full indemnity basis) and all other reasonable professional costs and
                    expenses) suffered or incurred or paid by us arising out of or in connection with any claim brought
                    against us for infringement of a third party's intellectual property rights arising out of, or in
                    connection with, your misuse of the platform or breach of these terms. This clause survives
                    termination or expiry.
                  </p>
                  <p>
                    <strong>5.5. Disclaimers</strong>
                  </p>
                  <div className="ml-4 space-y-2">
                    <p>
                      (i) The platform is provided "as is". To the fullest extent permitted by law, we and our
                      affiliates and licensors exclude all conditions, warranties and representations (express, implied,
                      statutory or otherwise) with respect to the platform, and disclaim all warranties including but
                      not limited to warranties of fitness for purpose and satisfactory quality. We do not warrant that
                      the platform will always be available, uninterrupted, accurate or free of errors.
                    </p>
                    <p>
                      (ii) The platform is provided to you for informational purposes only. While we endeavour to keep
                      content in the platform up-to-date, and while it has been obtained from sources believed to be
                      reliable, we do not make any representation, warranty (express or implied) or guarantee as to the
                      completeness, accuracy, timeliness or suitability of any part of the platform or that it is free
                      from error or omission.
                    </p>
                    <p>
                      (iii) Dynamic business context. If we are not involved in implementation or delivery, the
                      following applies. We do not make any representation or warranty or guarantee as to the timeliness
                      or suitability of any part of the deliverables if your business changes or the circumstances that
                      applied at the time of provision of the services or development of any deliverables no longer
                      apply, or if the materials and any information provided to us to provide the services/deliverables
                      are not relevant, accurate and complete. In any event, you need to apply your own discretion when
                      implementing, using or applying the deliverables, including any recommendations or suggestions
                      made by us, based on your judgement of their suitability and timeliness at the relevant time and
                      in the prevailing circumstances.
                    </p>
                    <p>
                      (iv) No legal, financial, or investment advice. The services/deliverables or content or
                      information on our website or social media do not constitute legal, financial, or investment
                      advice, or any other form of professional advice or regulated services, and the
                      services/deliverables, content and information are not a substitute for such advice.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(6) GENERAL RESTRICTIONS</h2>
                <div className="space-y-3">
                  <p>
                    <strong>6.1. You shall not:</strong>
                  </p>
                  <div className="ml-4 space-y-2">
                    <p>
                      (a) except as may be allowed by any applicable law which is incapable of exclusion by agreement
                      between the parties and except to the extent expressly permitted under the agreement:
                    </p>
                    <div className="ml-4 space-y-1">
                      <p>
                        (i) attempt to copy, modify, duplicate, create derivative works from, frame, mirror, republish,
                        download, display, transmit, or distribute all or any portion of the platform in any form or
                        media or by any means; or
                      </p>
                      <p>
                        (ii) attempt to de-compile, reverse compile, disassemble, reverse engineer or otherwise reduce
                        to human-perceivable form all or any part of the platform;
                      </p>
                    </div>
                    <p>
                      (b) access all or any part of the platform in order to build a product or service which competes
                      with the platform;
                    </p>
                    <p>(c) use the platform to provide services to third parties, unless agreed;</p>
                    <p>
                      (d) license, sell, rent, lease, transfer, assign, distribute, display, disclose, or otherwise
                      commercially exploit the platform;
                    </p>
                    <p>(e) make the platform available to any third party except the authorised users;</p>
                    <p>(f) attempt to obtain, or assist third parties in obtaining, access to the platform; or</p>
                    <p>
                      (g) introduce or permit the introduction of, any virus or vulnerability into our network and
                      information systems.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(7) DATA PROTECTION</h2>
                <div className="space-y-3">
                  <p>
                    (1) You and us agree to comply with the relevant obligations under applicable data protection laws
                    when processing personal data in connection with the agreement.
                  </p>
                  <p>(2) We will process your personal information in accordance with our privacy policy.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  (8) EVENTS OUTSIDE OUR CONTROL (FORCE MAJEURE)
                </h2>
                <div className="space-y-3">
                  <p>
                    If anything beyond our reasonable control occurs that prevents or delays our duties under these
                    terms, we're not responsible. If something like this does happen, we'll let you know, and our
                    responsibilities will be paused for its duration. If the disruption lasts more than 60 days, either
                    party can cancel the agreement immediately with written notice, and you'll need to pay the charges
                    and expenses or costs we've incurred up to the date of cancellation.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(9) ASSIGNMENT AND OTHER DEALINGS</h2>
                <div className="space-y-3">
                  <p>
                    (1) The agreement is personal to you, and you shall not assign, transfer, subcontract, delegate or
                    deal in any other manner with any of your rights and obligations under the agreement, without our
                    prior written consent.
                  </p>
                  <p>
                    (2) We may do so, including by novating the agreement (to transfer all our rights and obligations
                    under it), at any time to any person.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(10) CONFIDENTIALITY</h2>
                <div className="space-y-3">
                  <p>
                    (1) Each party agrees to keep information concerning the business, affairs, customers, clients or
                    suppliers of the other party strictly confidential except (a) when it's necessary to disclose it to
                    a party's team on a need-to-know basis and so long as said recipients are procured to also comply
                    with this clause 10; or (b) as may be required by law, regulation, a court of competent jurisdiction
                    or any governmental, judicial or regulatory authority.
                  </p>
                  <p>
                    (2) Neither party shall use the other party's confidential information for any purpose other than to
                    perform its obligations under the agreement, except that we may use data collected or generated
                    during the provision of services for any purpose at any time (including after termination or expiry
                    of the agreement), so long as said data does not directly or indirectly reveal your identity.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(11) ENTIRE AGREEMENT</h2>
                <div className="space-y-3">
                  <p>
                    The agreement constitutes the entire agreement between us and supersedes and extinguishes all
                    previous and contemporaneous agreements, promises, assurances, warranties, representations and
                    understandings between us, whether written or oral, relating to its subject matter.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(12) VARIATION</h2>
                <div className="space-y-3">
                  <p>No variation of the agreement by you or us has any effect unless it is agreed in writing.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(13) WAIVER</h2>
                <div className="space-y-3">
                  <p>
                    If a party chooses not to enforce a right or use a remedy, it must clearly state this in writing,
                    which doesn't mean they give up any rights or remedies. Not immediately using a right or remedy
                    doesn't mean it's waived. Using a right or remedy partially or once doesn't stop its future use or
                    effect.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(14) SEVERANCE</h2>
                <div className="space-y-3">
                  <p>
                    If any provision or part-provision of the agreement is or becomes invalid, illegal or unenforceable,
                    it shall be deemed modified to the minimum extent necessary to make it valid, legal and enforceable.
                    If that's not possible, the relevant provision or part-provision shall be deemed deleted. Any such
                    modification or deletion shall not affect the validity and enforceability of the rest of the
                    agreement.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(15) COMMUNICATION AND NOTICES</h2>
                <div className="space-y-3">
                  <p>
                    Any communication between you and us relating to the agreement must be in writing, using the latest
                    contact details provided. Notices are considered received when signed for in person, two business
                    days (in England) after mailing, or on email transmission.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(16) THIRD PARTY RIGHTS</h2>
                <div className="space-y-3">
                  <p>
                    Unless it expressly states otherwise, the agreement does not give rise to any rights under the
                    Contracts (Rights of Third Parties) Act 1999 to enforce any term of the agreement. The rights of the
                    parties to rescind or vary the agreement are not subject to the consent of any third party.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(17) COUNTERPARTS</h2>
                <div className="space-y-3">
                  <p>
                    If we require the agreement to be signed by the parties to have legal effect, the agreement may be
                    executed in counterparts, constituting one agreement.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(18) NO PARTNERSHIP</h2>
                <div className="space-y-3">
                  <p>
                    The agreement is not intended to (nor shall it be deemed to) establish any partnership or joint
                    venture between you and us, constitute any party the agent of the other, or authorise either party
                    to make or enter into any commitments for or on behalf of the other.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(19) SURVIVAL</h2>
                <div className="space-y-3">
                  <p>
                    Every provision of the agreement that expressly or by implication is intended to, shall come into or
                    continue in force on or after its termination or expiry.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">(20) GOVERNING LAW AND JURISDICTION</h2>
                <div className="space-y-3">
                  <p>
                    The agreement and any related dispute or claim will be governed by and construed according to the
                    laws of England and Wales. Both parties irrevocably agree that only the courts of England and Wales
                    have the authority to settle any dispute or claim.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay to close modal when clicking outside */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
